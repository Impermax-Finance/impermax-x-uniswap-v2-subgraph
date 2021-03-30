/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../types/schema'
import { BigDecimal, Address, BigInt, log } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, ADDRESS_ZERO, ONE_BD, uniswapFactoryContract } from './helpers'
import { WETH_ADDRESS, STABLE_WETH_PAIR } from './constants'
import {
  loadOrCreatePair,
} from './helpers'

export function getEthPriceInUSD(): BigDecimal {
  let stablePair = Pair.load(STABLE_WETH_PAIR)
  if (!stablePair) return ZERO_BD
  if (stablePair.token0 == WETH_ADDRESS) {
    return stablePair.token1Price
  }
  else {
	return stablePair.token0Price
  }
}


export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }
  let pairAddress = uniswapFactoryContract.getPair(Address.fromString(token.id), Address.fromString(WETH_ADDRESS))
  if (pairAddress.toHexString() == ADDRESS_ZERO) return ZERO_BD
  let pair = loadOrCreatePair(pairAddress)
  if (pair.token0 == token.id) {
	let token1 = Token.load(pair.token1)
	return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
  }
  else {
	let token0 = Token.load(pair.token0)
	return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
  }
}
