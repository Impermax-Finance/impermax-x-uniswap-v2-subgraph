/* eslint-disable prefer-const */
import { BigInt, BigDecimal, store, Address, log } from '@graphprotocol/graph-ts'
import { Pair, LendingPool, Collateral, Borrowable, Token, Bundle } from '../types/schema'
import { Pair as PairContract, Sync as Sync1, Mint as Mint1 } from '../types/templates/Pair/Pair'
import { StakedLPToken01 as StakedLPTokenContract, Sync as Sync2, Mint as Mint2 } from '../types/templates/StakedLPToken01/StakedLPToken01'
import { getEthPriceInUSD, findEthPerToken } from './pricing'
import { convertTokenToDecimal, ADDRESS_ZERO, ONE_BI, ZERO_BD, BI_18, updateLendingPoolUSD } from './helpers'


export function handleSync1(event: Sync1): void {
  let pair = Pair.load(event.address.toHex()) as Pair;
  let pairContract = PairContract.bind(event.address);
  let reserves = pairContract.getReserves();
  let totalSupply = pairContract.totalSupply();
  _handleSync(pair, reserves.value0, reserves.value1, totalSupply);
}

export function handleSync2(event: Sync2): void {
  let pair = Pair.load(event.address.toHex()) as Pair;
  let stakedLPTokenContract = StakedLPTokenContract.bind(event.address);
  let reserves = stakedLPTokenContract.getReserves();
  let totalSupply = stakedLPTokenContract.totalSupply();
  _handleSync(pair, reserves.value0, reserves.value1, totalSupply);
}

function _handleSync(pair: Pair, reserve0: BigInt, reserve1: BigInt, totalSupply: BigInt): void {
	
  pair.syncCount = pair.syncCount.plus(ONE_BI)
  
  // faster sync
  //pair.save()
  //if (pair.syncCount as i32 % 10 !== 1) return
  
  let token0 = Token.load(pair.token0)
  let token1 = Token.load(pair.token1)
  
  pair.reserve0 = convertTokenToDecimal(reserve0, token0.decimals)
  pair.reserve1 = convertTokenToDecimal(reserve1, token1.decimals)

  if (pair.reserve1.notEqual(ZERO_BD)) pair.token0Price = pair.reserve0.div(pair.reserve1)
  else pair.token0Price = ZERO_BD
  if (pair.reserve0.notEqual(ZERO_BD)) pair.token1Price = pair.reserve1.div(pair.reserve0)
  else pair.token1Price = ZERO_BD

  pair.save()

  // update ETH price now that reserves could have changed
  let bundle = Bundle.load('1')
  bundle.ethPrice = getEthPriceInUSD()
  bundle.save()

  token0.derivedETH = findEthPerToken(token0 as Token)
  token1.derivedETH = findEthPerToken(token1 as Token)
  token0.derivedUSD = token0.derivedETH.times(bundle.ethPrice)
  token1.derivedUSD = token1.derivedETH.times(bundle.ethPrice)
  token0.save()
  token1.save()

  // use derived amounts within pair
  pair.reserveETH = pair.reserve0
    .times(token0.derivedETH as BigDecimal)
    .plus(pair.reserve1.times(token1.derivedETH as BigDecimal))
  pair.reserveUSD = pair.reserveETH.times(bundle.ethPrice)
  pair.save()
 
  // update total supply
  pair.totalSupply = convertTokenToDecimal(totalSupply, BI_18)
  pair.save()
  
  // update LP price
  pair.derivedETH = pair.reserveETH.div(pair.totalSupply)
  pair.derivedUSD = pair.reserveUSD.div(pair.totalSupply)

  // save entities
  pair.save()
  token0.save()
  token1.save()
  
  // update lendingPool usd values
  //updateLendingPoolUSD(pair.id)
}