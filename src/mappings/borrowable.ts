import { BigInt, BigDecimal, Address, log } from "@graphprotocol/graph-ts"
import {
  Sync,
  AccrueInterest,
  Borrow,
  Liquidate,
  CalculateKinkBorrowRate,
  CalculateBorrowRate,
  NewReserveFactor,
  NewKinkUtilizationRate,
  NewBorrowTracker,
} from "../types/templates/Borrowable/Borrowable"
import { Borrowable, Token, LendingPool, FarmingPool } from "../types/schema"
import { FarmingPool as FarmingPoolTemplate } from '../types/templates'
import {
  convertTokenToDecimal,
  BI_18,
  ZERO_BD,
  ZERO_BI,
  ADDRESS_ZERO,
  updateLendingPoolUSD,
  fetchFarmingPoolClaimable,
  fetchFarmingPoolEpochAmount,
  fetchFarmingPoolEpochBegin,
  fetchFarmingPoolSegmentLength,
  fetchFarmingPoolVestingBegin,
  fetchDistributorSharePercentage,
  loadOrCreateDistributor,
} from './helpers'

function getDecimals(borrowable: Borrowable | null): BigInt {
  return Token.load(borrowable.underlying).decimals
}

export function handleSync(event: Sync): void {
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.totalBalance = convertTokenToDecimal(event.params.totalBalance, getDecimals(borrowable))
  borrowable.save()
  updateLendingPoolUSD(borrowable.lendingPool)
}

export function handleAccrueInterest(event: AccrueInterest): void {
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.totalBorrows = convertTokenToDecimal(event.params.totalBorrows, getDecimals(borrowable))
  borrowable.accrualTimestamp = event.block.timestamp
  borrowable.save()
}

export function handleLiquidate(event: Liquidate): void {
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.totalBorrows = convertTokenToDecimal(event.params.totalBorrows, getDecimals(borrowable))
  borrowable.save()
}

export function handleBorrow(event: Borrow): void {
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.totalBorrows = convertTokenToDecimal(event.params.totalBorrows, getDecimals(borrowable))
  borrowable.save()
}

export function handleCalculateKinkBorrowRate(event: CalculateKinkBorrowRate): void {
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.kinkBorrowRate = convertTokenToDecimal(event.params.kinkBorrowRate, BI_18)
  borrowable.save()
}

export function handleCalculateBorrowRate(event: CalculateBorrowRate): void {
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.borrowRate = convertTokenToDecimal(event.params.borrowRate, BI_18)
  borrowable.save()
}

export function handleNewReserveFactor(event: NewReserveFactor): void {
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.reserveFactor = convertTokenToDecimal(event.params.newReserveFactor, BI_18)
  borrowable.save()
}

export function handleNewKinkUtilizationRate(event: NewKinkUtilizationRate): void {
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.kinkUtilizationRate = convertTokenToDecimal(event.params.newKinkUtilizationRate, BI_18)
  borrowable.save()
}

export function handleNewBorrowTracker(event: NewBorrowTracker): void {
  let farmingPoolAddress = event.params.newBorrowTracker
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.farmingPool = farmingPoolAddress.toHexString()
  borrowable.save()
  if (farmingPoolAddress.toHexString() === ADDRESS_ZERO) return
  let farmingPool = FarmingPool.load(farmingPoolAddress.toHexString())
  if (farmingPool === null) {
	let distributorAddress = fetchFarmingPoolClaimable(farmingPoolAddress)
	let distributor = loadOrCreateDistributor(distributorAddress)
	farmingPool = new FarmingPool(farmingPoolAddress.toHexString())
	farmingPool.borrowable = borrowable.id
	farmingPool.distributor = distributor.id
	farmingPool.epochAmount = fetchFarmingPoolEpochAmount(farmingPoolAddress)
	farmingPool.epochBegin = fetchFarmingPoolEpochBegin(farmingPoolAddress)
	farmingPool.segmentLength = fetchFarmingPoolSegmentLength(farmingPoolAddress)
	farmingPool.vestingBegin = fetchFarmingPoolVestingBegin(farmingPoolAddress)
	farmingPool.sharePercentage = fetchDistributorSharePercentage(distributorAddress, farmingPoolAddress)
	farmingPool.save()
	FarmingPoolTemplate.create(farmingPoolAddress)
  }
}
