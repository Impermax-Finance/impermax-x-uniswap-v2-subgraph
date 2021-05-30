/* eslint-disable prefer-const */
import { BigInt, BigDecimal, store, Address, log } from '@graphprotocol/graph-ts'
import { StakingRewards } from '../types/schema'
import { StakingRewards as StakingRewardsContract, RewardAdded, Staked, Withdrawn } from '../types/templates/StakingRewards/StakingRewards'
import { convertTokenToDecimal, ADDRESS_ZERO, ONE_BI, ZERO_BD, BI_18 } from './helpers'


export function handleRewardAdded(event: RewardAdded): void {
  let stakingRewards = StakingRewards.load(event.address.toHex()) as StakingRewards;
  let stakingRewardsContract = StakingRewardsContract.bind(event.address)
  stakingRewards.rewardRate = convertTokenToDecimal(stakingRewardsContract.rewardRate(), BI_18)
  stakingRewards.periodFinish = stakingRewardsContract.periodFinish()
  stakingRewards.save()
}

export function handleStaked(event: Staked): void {
  let stakingRewards = StakingRewards.load(event.address.toHex()) as StakingRewards;
  stakingRewards.totalSupply += convertTokenToDecimal(event.params.amount, BI_18)
  stakingRewards.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let stakingRewards = StakingRewards.load(event.address.toHex()) as StakingRewards;
  stakingRewards.totalSupply -= convertTokenToDecimal(event.params.amount, BI_18)
  stakingRewards.save()
}
