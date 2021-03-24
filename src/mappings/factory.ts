import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import {
  LendingPoolInitialized
} from "../types/Factory/Factory"
import { Factory, Token, LendingPool, Collateral, Borrowable } from "../types/schema"
import {
  FACTORY_ADDRESS,
  ZERO_BD,
  ZERO_BI,
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenDecimals,
  fetchTokenTotalSupply
} from './helpers'


export function handleLendingPoolInitialized(event: LendingPoolInitialized): void {
  let factory = Factory.load(FACTORY_ADDRESS)
  if (factory === null) {
	factory = new Factory(FACTORY_ADDRESS)
  }
  factory.save()
  
  let token0 = Token.load(event.params.token0.toHexString())
  let token1 = Token.load(event.params.token1.toHexString())

  if (token0 === null) {
	token0 = new Token(event.params.token0.toHexString())
    token0.symbol = fetchTokenSymbol(event.params.token0)
    token0.name = fetchTokenName(event.params.token0)
    token0.decimals = fetchTokenDecimals(event.params.token0)
  }
  if (token1 === null) {
	token1 = new Token(event.params.token1.toHexString())
    token1.symbol = fetchTokenSymbol(event.params.token1)
    token1.name = fetchTokenName(event.params.token1)
    token1.decimals = fetchTokenDecimals(event.params.token1)
  }
  
  token0.save()
  token1.save()
  
  let collateral = new Collateral(event.params.collateral.toHexString())
  collateral.totalBalance = ZERO_BD
  collateral.safetyMargin = BigDecimal.fromString('1.5811388')
  collateral.liquidationIncentive = BigDecimal.fromString('1.04')
  collateral.save()
  
  let borrowable0 = new Borrowable(event.params.borrowable0.toHexString())
  let borrowable1 = new Borrowable(event.params.borrowable1.toHexString())
  
  borrowable0.underlying = token0.id
  borrowable0.totalBalance = ZERO_BD
  borrowable0.totalBorrows = ZERO_BD
  borrowable0.borrowRate = ZERO_BD
  borrowable0.reserveFactor = BigDecimal.fromString('0.1')
  borrowable0.kinkBorrowRate = BigDecimal.fromString('0.1')
  borrowable0.kinkUtilizationRate = BigDecimal.fromString('0.7')
  borrowable0.accrualTimestamp = event.block.timestamp
  
  borrowable1.underlying = token1.id
  borrowable1.totalBalance = ZERO_BD
  borrowable1.totalBorrows = ZERO_BD
  borrowable1.borrowRate = ZERO_BD
  borrowable1.reserveFactor = BigDecimal.fromString('0.1')
  borrowable1.kinkBorrowRate = BigDecimal.fromString('0.1')
  borrowable1.kinkUtilizationRate = BigDecimal.fromString('0.7')
  borrowable1.accrualTimestamp = event.block.timestamp
  
  borrowable0.save()
  borrowable1.save()
  
  let lendingPool = new LendingPool(event.params.uniswapV2Pair.toHexString())
  lendingPool.collateral = collateral.id
  lendingPool.borrowable0 = borrowable0.id
  lendingPool.borrowable1 = borrowable1.id
  lendingPool.save()
}

