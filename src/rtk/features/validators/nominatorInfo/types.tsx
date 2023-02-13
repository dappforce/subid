import { RewardDestination } from '../../../../components/staking/validators/contexts/NominatingContext'

export type Unlocking = {
  value: string
  era: string
}

export type StakingLedger = {
  active: string
  stash: string
  total: string
  claimedRewards: string[]
  unlocking: Unlocking[]
}

export type NominatorInfo = {
  accountId: string
  controllerId: string
  nominators: string[]
  rewardDestination: RewardDestination
  stakingLedger: StakingLedger
  submittedIn: string
  suppressed: boolean
}

export type FetchNominatorInfoProps = {
  network: string
  account: string
  reload?: boolean | undefined
}
