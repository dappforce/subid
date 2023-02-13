export type StakingReward = {
  account: string
  amount: string
  block_timestamp: number
  era: number
  event_id: string
  event_index: string
  extrinsic_index: string
  invalid_era: false
  module_id: string
  slash_kton: string
  stash: string
  validator_stash: string
}

export type FetchStakingRewardProps = {
  network: string
  account: string
  reload?: boolean
}