import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, stubFn, FetchProps, upsertManyEntity } from '../../../app/util'
import { StakingCandidate, StakingCandidateInfoRecord } from '../utils'
import { isEmptyStr, isEmptyObj } from '@subsocial/utils'
import { EntityState } from '@reduxjs/toolkit'

export type StakingCandidatesInfoEntity = {
  id: string
  loading: boolean
  info: StakingCandidate
}

export type FetchCandidatesInfoProps = FetchProps & {
  network: string
}

const stakingCandidatesInfoAdapter = createEntityAdapter<StakingCandidatesInfoEntity>()

const stakingCadidatesSelector = stakingCandidatesInfoAdapter.getSelectors()

export const selectStakingCandidateInfo = (state: RootState, account: string, network: string) =>
  stakingCadidatesSelector.selectById(state.stakingCandidatesInfo, `${account}-${network}`)

export const selectStakingCandidatesInfo = (state: RootState, network: string, accounts?: string[]) => {
  const stakingCandidateInfo: StakingCandidateInfoRecord = {}

  accounts?.forEach(account => {
    if(!isEmptyStr(account)) {
      const balanceEntity = selectStakingCandidateInfo(state, account, network)

      if(balanceEntity) {
        stakingCandidateInfo[account] = balanceEntity
      }
    }
  })

  return isEmptyObj(stakingCandidateInfo) ? undefined : stakingCandidateInfo
}

const slice = createSlice({
  name: 'stakingCandidatesInfo',
  initialState: stakingCandidatesInfoAdapter.getInitialState(),
  reducers: {
    fetchCandidatesInfo: (state, action: PayloadAction<FetchCandidatesInfoProps>) => {
      const { accounts, reload, network } = action.payload

      upsertManyEntity({
        adapter: stakingCandidatesInfoAdapter,
        state: state as EntityState<StakingCandidatesInfoEntity>,
        reload,
        fieldName: 'info',
        network,
        accounts,
        selector: stakingCadidatesSelector
      })
      return
    },
    fetchCandidatesInfoSuccess: (state, action: PayloadAction<StakingCandidatesInfoEntity[]>) => {
      stakingCandidatesInfoAdapter.upsertMany(state, action.payload)
    },
    fetchCandidatesInfoFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('stakingCandidatesInfo')
  },
})

export const stakingCandidatesInfoActions = slice.actions

export default slice.reducer
