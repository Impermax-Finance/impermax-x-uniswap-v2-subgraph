import { BigInt } from "@graphprotocol/graph-ts"
import {
  Factory,
  LendingPoolInitialized,
  NewAdmin,
  NewPendingAdmin,
  NewReservesAdmin,
  NewReservesManager,
  NewReservesPendingAdmin
} from "../generated/Factory/Factory"
import { ExampleEntity } from "../generated/schema"

export function handleLendingPoolInitialized(
  event: LendingPoolInitialized
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.uniswapV2Pair = event.params.uniswapV2Pair
  entity.token0 = event.params.token0

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.admin(...)
  // - contract.allLendingPools(...)
  // - contract.allLendingPoolsLength(...)
  // - contract.bDeployer(...)
  // - contract.cDeployer(...)
  // - contract.createBorrowable0(...)
  // - contract.createBorrowable1(...)
  // - contract.createCollateral(...)
  // - contract.getLendingPool(...)
  // - contract.pendingAdmin(...)
  // - contract.reservesAdmin(...)
  // - contract.reservesManager(...)
  // - contract.reservesPendingAdmin(...)
  // - contract.simpleUniswapOracle(...)
  // - contract.uint2str(...)
  // - contract.uniswapV2Factory(...)
}

export function handleNewAdmin(event: NewAdmin): void {}

export function handleNewPendingAdmin(event: NewPendingAdmin): void {}

export function handleNewReservesAdmin(event: NewReservesAdmin): void {}

export function handleNewReservesManager(event: NewReservesManager): void {}

export function handleNewReservesPendingAdmin(
  event: NewReservesPendingAdmin
): void {}
