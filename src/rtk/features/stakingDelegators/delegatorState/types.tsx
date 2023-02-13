import { FetchProps } from '../../../app/util'
import { StakingDelegatorStateEntity } from './stakingDelegatorsStateSlice'

type Delegations = {
  owner: string
  amount: string
}

export type DelegatorState = {
  id: string
  delegations: Delegations[]
  total: string
  lessTotal: number
  status: string
}

export type StakingDelegatorStateEntityRecord = Record<string, StakingDelegatorStateEntity>

export type FetchDelegatorStateProps = FetchProps & {
  network: string
}
