/* eslint-disable prefer-const */
import { log, BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { ERC20 } from '../types/ImpermaxFactory/ERC20'
import { ERC20SymbolBytes } from '../types/ImpermaxFactory/ERC20SymbolBytes'
import { ERC20NameBytes } from '../types/ImpermaxFactory/ERC20NameBytes'
import { IMPERMAX_FACTORY_ADDRESS, UNISWAP_FACTORY_ADDRESS } from './constants'
import { ImpermaxFactory, Borrowable, Collateral, LendingPool, Token, Pair, Distributor, User, CollateralPosition, SupplyPosition, BorrowPosition, StakingRewards } from "../types/schema"
import { UniswapFactory as UniswapFactoryContract } from '../types/ImpermaxFactory/UniswapFactory'
import { Pair as PairContract } from '../types/ImpermaxFactory/Pair'
import { FarmingPool as FarmingPoolContract } from '../types/ImpermaxFactory/FarmingPool'
import { Distributor as DistributorContract } from '../types/ImpermaxFactory/Distributor'
import { Collateral as CollateralContract } from '../types/ImpermaxFactory/Collateral'
import { Borrowable as BorrowableContract } from '../types/ImpermaxFactory/Borrowable'
import { StakedLPToken01 as StakedLPTokenContract } from '../types/ImpermaxFactory/StakedLPToken01'
import { StakingRewards as StakingRewardsContract } from '../types/ImpermaxFactory/StakingRewards'
import { Pair as PairTemplate } from '../types/templates'
import { StakedLPToken01 as StakedLPTokenTemplate } from '../types/templates'
import { StakingRewards as StakingRewardsTemplate } from '../types/templates'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let uniswapFactoryContract = UniswapFactoryContract.bind(Address.fromString(UNISWAP_FACTORY_ADDRESS))

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(18))
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(ZERO_BD.toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress)
  let totalSupplyValue = null
  let totalSupplyResult = contract.try_totalSupply()
  if (!totalSupplyResult.reverted) {
    totalSupplyValue = totalSupplyResult as i32
  }
  return BigInt.fromI32(totalSupplyValue as i32)
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress)
  // try types uint8 for decimals
  let decimalValue = null
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }
  return BigInt.fromI32(decimalValue as i32)
}

export function fetchCollateralExchangeRate(collateralAddress: Address): BigDecimal {
  let contract = CollateralContract.bind(collateralAddress)
  return convertTokenToDecimal(contract.exchangeRate(), BI_18)
}

export function fetchBorrowableExchangeRate(borrowableAddress: Address): BigDecimal {
  let contract = BorrowableContract.bind(borrowableAddress)
  return convertTokenToDecimal(contract.exchangeRate(), BI_18)
}

export function fetchFarmingPoolClaimable(farmingPoolAddress: Address): Address {
  let contract = FarmingPoolContract.bind(farmingPoolAddress)
  return contract.claimable()
}

export function fetchFarmingPoolEpochAmount(farmingPoolAddress: Address): BigDecimal {
  let contract = FarmingPoolContract.bind(farmingPoolAddress)
  return convertTokenToDecimal(contract.epochAmount(), BI_18)
}

export function fetchFarmingPoolEpochBegin(farmingPoolAddress: Address): BigInt {
  let contract = FarmingPoolContract.bind(farmingPoolAddress)
  return contract.epochBegin()
}

export function fetchFarmingPoolSegmentLength(farmingPoolAddress: Address): BigInt {
  let contract = FarmingPoolContract.bind(farmingPoolAddress)
  return contract.segmentLength()
}

export function fetchFarmingPoolVestingBegin(farmingPoolAddress: Address): BigInt {
  let contract = FarmingPoolContract.bind(farmingPoolAddress)
  return contract.vestingBegin()
}

export function fetchDistributorSharePercentage(distributorAddress: Address, farmingPoolAddress: Address): BigDecimal {
  let contract = DistributorContract.bind(distributorAddress)
  let totalShares = contract.totalShares().toBigDecimal()
  let recipients = contract.recipients(farmingPoolAddress)
  let shares = recipients.value0.toBigDecimal()
  return shares.div(totalShares)
}


export function loadOrCreateToken(tokenAddress: Address): Token {
  let token = Token.load(tokenAddress.toHexString())
  // fetch info if null
  if (token === null) {
    token = new Token(tokenAddress.toHexString())
    token.symbol = fetchTokenSymbol(tokenAddress)
    token.name = fetchTokenName(tokenAddress)
    token.decimals = fetchTokenDecimals(tokenAddress)
    token.derivedETH = ZERO_BD
    token.derivedUSD = ZERO_BD
  }
  token.save()
  return token as Token
}

export function loadOrCreatePair(pairAddress: Address): Pair {
  let pair = Pair.load(pairAddress.toHexString())
  // fetch info if null
  if (pair === null) {
	let contract = PairContract.bind(pairAddress)
	let token0Address = contract.token0()
	let token1Address = contract.token1()
	
	loadOrCreateToken(token0Address)
	loadOrCreateToken(token1Address)
	
    pair = new Pair(pairAddress.toHexString())
    pair.token0 = token0Address.toHexString()
    pair.token1 = token1Address.toHexString()
    pair.reserve0 = ZERO_BD
    pair.reserve1 = ZERO_BD
    pair.totalSupply = ZERO_BD
    pair.reserveETH = ZERO_BD
    pair.reserveUSD = ZERO_BD
    pair.token0Price = ZERO_BD
    pair.token1Price = ZERO_BD
    pair.derivedETH = ZERO_BD
    pair.derivedUSD = ZERO_BD
    pair.syncCount = ZERO_BI
    pair.isStakedLPToken = false

    PairTemplate.create(pairAddress)
    
    // check if stakedLpToken
    let stakedLPTokenContract = StakedLPTokenContract.bind(pairAddress)
	let isStakedLPTokenCallResult = stakedLPTokenContract.try_isStakedLPToken()
    if (!isStakedLPTokenCallResult.reverted && isStakedLPTokenCallResult.value) {
      let stakingRewardsAddress = stakedLPTokenContract.stakingRewards()
      let stakingRewardsContract = StakingRewardsContract.bind(stakingRewardsAddress)
      let stakingRewards = new StakingRewards(stakingRewardsAddress.toHexString())
      stakingRewards.rewardsToken = stakingRewardsContract.rewardsToken().toHexString()
      stakingRewards.rewardRate = convertTokenToDecimal(stakingRewardsContract.rewardRate(), BI_18)
      stakingRewards.totalSupply = convertTokenToDecimal(stakingRewardsContract.totalSupply(), BI_18)
      stakingRewards.periodFinish = stakingRewardsContract.periodFinish()
      stakingRewards.save()
      StakedLPTokenTemplate.create(pairAddress)
      StakingRewardsTemplate.create(stakingRewardsAddress)
  	
	  pair.isStakedLPToken = true
      pair.stakingRewards = stakingRewardsAddress.toHexString()
    }
  }
  pair.save()
  return pair as Pair
}

export function loadOrCreateDistributor(distributorAddress: Address): Distributor {
  let distributor = Distributor.load(distributorAddress.toHexString())
  // fetch info if null
  if (distributor === null) {
    distributor = new Distributor(distributorAddress.toHexString())
  }
  distributor.save()
  return distributor as Distributor
}

export function loadOrCreateUser(address: Address): void {
  let user = User.load(address.toHexString())
  if (user === null) {
    user = new User(address.toHexString())
    user.save()
  }
}

export function loadOrCreateCollateralPosition(collateral: Address, user: Address): CollateralPosition {
  let id = collateral.toHexString().concat('-').concat(user.toHexString())
  let collateralPosition = CollateralPosition.load(id)
  if (collateralPosition === null) {
	loadOrCreateUser(user)
    collateralPosition = new CollateralPosition(id)
    collateralPosition.collateral = collateral.toHexString()
    collateralPosition.user = user.toHexString()
    collateralPosition.balance = ZERO_BD
    collateralPosition.save()
  }
  return collateralPosition as CollateralPosition
}

export function loadOrCreateSupplyPosition(borrowable: Address, user: Address): SupplyPosition {
  let id = borrowable.toHexString().concat('-').concat(user.toHexString())
  let supplyPosition = SupplyPosition.load(id)
  if (supplyPosition === null) {
	loadOrCreateUser(user)
    supplyPosition = new SupplyPosition(id)
    supplyPosition.borrowable = borrowable.toHexString()
    supplyPosition.user = user.toHexString()
    supplyPosition.balance = ZERO_BD
    supplyPosition.save()
  }
  return supplyPosition as SupplyPosition
}

export function loadOrCreateBorrowPosition(borrowable: Address, user: Address): BorrowPosition {
  let id = borrowable.toHexString().concat('-').concat(user.toHexString())
  let borrowPosition = BorrowPosition.load(id)
  if (borrowPosition === null) {
	loadOrCreateUser(user)
    borrowPosition = new BorrowPosition(id)
    borrowPosition.borrowable = borrowable.toHexString()
    borrowPosition.user = user.toHexString()
    borrowPosition.borrowBalance = ZERO_BD
    borrowPosition.borrowIndex = ONE_BD
    borrowPosition.save()
  }
  return borrowPosition as BorrowPosition
}

export function updateLendingPoolUSD(pairAddress: String): void {
  let pair = Pair.load(pairAddress)

  let lendingPool = LendingPool.load(pairAddress)
  if (lendingPool === null) return // lendingPool doesn't exist yet for this pair
  
  let prevTotalBalanceUSD = lendingPool.totalBalanceUSD
  let prevTotalSupplyUSD = lendingPool.totalSupplyUSD
  let prevTotalBorrowsUSD = lendingPool.totalBorrowsUSD
    
  let collateral = Collateral.load(lendingPool.collateral)
  collateral.totalBalanceUSD = collateral.totalBalance.times(pair.derivedUSD)
  collateral.save()
  
  let borrowable0 = Borrowable.load(lendingPool.borrowable0)
  let borrowable1 = Borrowable.load(lendingPool.borrowable1)
  let token0 = Token.load(borrowable0.underlying)
  let token1 = Token.load(borrowable1.underlying)
  
  borrowable0.totalBalanceUSD = borrowable0.totalBalance.times(token0.derivedUSD)
  borrowable0.totalBorrowsUSD = borrowable0.totalBorrows.times(token0.derivedUSD)
  borrowable0.totalSupplyUSD = borrowable0.totalBalanceUSD.plus(borrowable0.totalBorrowsUSD)
  borrowable1.totalBalanceUSD = borrowable1.totalBalance.times(token1.derivedUSD)
  borrowable1.totalBorrowsUSD = borrowable1.totalBorrows.times(token1.derivedUSD)
  borrowable1.totalSupplyUSD = borrowable1.totalBalanceUSD.plus(borrowable1.totalBorrowsUSD)
  
  borrowable0.save()
  borrowable1.save()
  
  lendingPool.totalBalanceUSD = collateral.totalBalanceUSD.plus(borrowable0.totalBalanceUSD).plus(borrowable1.totalBalanceUSD)
  lendingPool.totalSupplyUSD = borrowable0.totalSupplyUSD.plus(borrowable1.totalSupplyUSD)
  lendingPool.totalBorrowsUSD = borrowable0.totalBorrowsUSD.plus(borrowable1.totalBorrowsUSD)
  lendingPool.save()
  
  let impermaxFactory = ImpermaxFactory.load(IMPERMAX_FACTORY_ADDRESS)
  if (impermaxFactory === null) return
  impermaxFactory.totalBalanceUSD = impermaxFactory.totalBalanceUSD.plus(lendingPool.totalBalanceUSD).minus(prevTotalBalanceUSD)
  impermaxFactory.totalSupplyUSD = impermaxFactory.totalSupplyUSD.plus(lendingPool.totalSupplyUSD).minus(prevTotalSupplyUSD)
  impermaxFactory.totalBorrowsUSD = impermaxFactory.totalBorrowsUSD.plus(lendingPool.totalBorrowsUSD).minus(prevTotalBorrowsUSD)
  impermaxFactory.save()
}