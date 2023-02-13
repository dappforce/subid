import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, FetchProps, upsertManyEntity } from '../../../app/util'
import { isEmptyStr, isEmptyObj } from '@subsocial/utils'
import { EntityState } from '@reduxjs/toolkit'
import { DelegatorState, StakingDelegatorStateEntityRecord } from './types'

export type StakingDelegatorStateEntity = {
  id: string
  loading: boolean
  state: DelegatorState
}

export type FetchCandidatesInfoProps = FetchProps & {
  network: string
}

const stakingDelegatorStateAdapter = createEntityAdapter<StakingDelegatorStateEntity>()

const stakingDelegatorStateSelector = stakingDelegatorStateAdapter.getSelectors()

export const selectStakingDelegatorState = (state: RootState, account: string, network: string) =>
  stakingDelegatorStateSelector.selectById(state.stakingDelegatorState, `${account}-${network}`)

export const selectStakingDelegatorsState = (state: RootState, network: string, accounts?: string[]) => {
  const stakingCandidateInfo: StakingDelegatorStateEntityRecord = {}

  accounts?.forEach(account => {
    if(!isEmptyStr(account)) {
      const balanceEntity = selectStakingDelegatorState(state, account, network)

      if(balanceEntity) {
        stakingCandidateInfo[account] = balanceEntity
      }
    }
  })

  return isEmptyObj(stakingCandidateInfo) ? undefined : stakingCandidateInfo
}

const slice = createSlice({
  name: 'stakingDelegatorState',
  initialState: stakingDelegatorStateAdapter.getInitialState(),
  reducers: {
    fetchDelegatorState: (state, action: PayloadAction<FetchCandidatesInfoProps>) => {
      const { accounts, reload, network } = action.payload

      upsertManyEntity({
        adapter: stakingDelegatorStateAdapter,
        state: state as EntityState<StakingDelegatorStateEntity>,
        reload,
        fieldName: 'state',
        network,
        accounts,
        selector: stakingDelegatorStateSelector
      })
      return
    },
    fetchDelegatorStateSuccess: (state, action: PayloadAction<StakingDelegatorStateEntity[]>) => {
      stakingDelegatorStateAdapter.upsertMany(state, action.payload)
    },
    fetchDelegatorStateFailed: (state, action: PayloadAction<FetchCandidatesInfoProps>) => {
      const { accounts, reload = true, network } = action.payload

      upsertManyEntity({
        adapter: stakingDelegatorStateAdapter,
        state: state as EntityState<StakingDelegatorStateEntity>,
        reload,
        loading: false,
        fieldName: 'state',
        network,
        accounts,
        selector: stakingDelegatorStateSelector
      })
      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('stakingDelegatorState')
  },
})

export const stakingDelegatorStateActions = slice.actions

export default slice.reducer
