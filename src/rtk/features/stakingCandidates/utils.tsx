import { StakingCandidatesInfoEntity } from './candidatesInfo/stakingCandidatesInfoSlice'
export const supportedStakingNetworks = [ 'bifrost', 'zeitgeist' ]
export const evmStakingNetworks = [ 'moonriver', 'moonbeam' ]

export type StakingCandidateInfoRecord = Record<string, StakingCandidatesInfoEntity>

export type StakingCandidate = {
  id: string
  bond: string
  delegationCount: number
  totalCounted: string
  lowestTopDelegationAmount: string
  highestBottomDelegationAmount: string
  lowestBottomDelegationAmount: string
  topCapacity: string
  bottomCapacity: string
  request: string
  status: string
}