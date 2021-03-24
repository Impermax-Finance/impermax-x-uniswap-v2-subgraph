import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import {
  Sync,
  AccrueInterest,
  Borrow,
  Liquidate,
  CalculateKinkBorrowRate,
  CalculateBorrowRate,
  NewReserveFactor,
  NewKinkUtilizationRate,
} from "../types/templates/Borrowable/Borrowable"
import { Borrowable, Token } from "../types/schema"
import {
  convertTokenToDecimal,
  BI_18,
  ZERO_BD,
  ZERO_BI,
} from './helpers'

function getDecimals(borrowable: Borrowable | null): BigInt {
  return Token.load(borrowable.underlying).decimals
}

export function handleSync(event: Sync): void {
  let borrowable = Borrowable.load(event.address.toHexString())
  borrowable.totalBalance = convertTokenToDecimal(event.params.totalBalance, getDecimals(borrowable))
  borrowable.save()
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
