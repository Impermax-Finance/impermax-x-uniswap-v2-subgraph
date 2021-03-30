import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import {
  Sync,
  NewSafetyMargin,
  NewLiquidationIncentive,
} from "../types/templates/Collateral/Collateral"
import { Collateral, LendingPool } from "../types/schema"
import {
  convertTokenToDecimal,
  BI_18,
  ZERO_BD,
  ZERO_BI,
  updateLendingPoolUSD,
} from './helpers'


export function handleSync(event: Sync): void {
  let collateral = Collateral.load(event.address.toHexString())
  collateral.totalBalance = convertTokenToDecimal(event.params.totalBalance, BI_18)
  collateral.save()
  updateLendingPoolUSD(collateral.lendingPool)
}

export function handleNewSafetyMargin(event: NewSafetyMargin): void {
  let collateral = Collateral.load(event.address.toHexString())
  let safetyMarginSqrt = convertTokenToDecimal(event.params.newSafetyMarginSqrt, BI_18)
  collateral.safetyMargin = safetyMarginSqrt.times(safetyMarginSqrt)
  collateral.save()
}

export function handleNewLiquidationIncentive(event: NewLiquidationIncentive): void {
  let collateral = Collateral.load(event.address.toHexString())
  collateral.liquidationIncentive = convertTokenToDecimal(event.params.newLiquidationIncentive, BI_18)
  collateral.save()
}
