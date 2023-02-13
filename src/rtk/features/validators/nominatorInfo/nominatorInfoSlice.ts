import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, upsertOneEntity } from '../../../app/util'
import { EntityState } from '@reduxjs/toolkit'
import { NominatorInfo, FetchNominatorInfoProps } from './types'

export type StakingNominatorInfoEntity = {
  id: string
  loading: boolean
  info: NominatorInfo
}

const stakingNominatorInfoAdapter = createEntityAdapter<StakingNominatorInfoEntity>()

const stakingNominatorInfoSelector = stakingNominatorInfoAdapter.getSelectors()

export const selectStakingNominatorInfo = (state: RootState, account: string, network: string) =>
  stakingNominatorInfoSelector.selectById(state.nominatorInfo, `${account}-${network}`) || {} as StakingNominatorInfoEntity

const slice = createSlice({
  name: 'nominatorInfo',
  initialState: stakingNominatorInfoAdapter.getInitialState(),
  reducers: {
    fetchNominatorInfo: (state, action: PayloadAction<FetchNominatorInfoProps>) => {
      const { account, reload, network } = action.payload

      const info = stakingNominatorInfoSelector.selectById(state, `${account}-${network}`)

      upsertOneEntity({
        adapter: stakingNominatorInfoAdapter,
        state: state as EntityState<StakingNominatorInfoEntity>,
        reload,
        fieldName: 'info',
        id: `${account}-${network}`,
        entity: info,
      })
      return
    },
    fetchNominatorInfoSuccess: (state, action: PayloadAction<StakingNominatorInfoEntity>) => {
      stakingNominatorInfoAdapter.upsertOne(state, action.payload)
    },
    fetchControllerSuccess: (state, action: PayloadAction<StakingNominatorInfoEntity>) => {
      stakingNominatorInfoAdapter.upsertOne(state, action.payload)
    },
    fetchNominatorsSuccess: (state, action: PayloadAction<StakingNominatorInfoEntity>) => {
      stakingNominatorInfoAdapter.upsertOne(state, action.payload)
    },
    fetchRewardDestinationSuccess: (state, action: PayloadAction<StakingNominatorInfoEntity>) => {
      stakingNominatorInfoAdapter.upsertOne(state, action.payload)
    },
    fetchStakingLadgerSuccess: (state, action: PayloadAction<StakingNominatorInfoEntity>) => {
      stakingNominatorInfoAdapter.upsertOne(state, action.payload)
    },
    fetcNominatorInfoFailed: (state, action: PayloadAction<FetchNominatorInfoProps>) => {
      const { account, reload = true, network } = action.payload

      const info = stakingNominatorInfoSelector.selectById(state, `${account}-${network}`)

      upsertOneEntity({
        adapter: stakingNominatorInfoAdapter,
        state: state as EntityState<StakingNominatorInfoEntity>,
        reload,
        loading: false,
        fieldName: 'info',
        id: `${account}-${network}`,
        entity: info,
      })
      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('nominatorInfo')
  },
})

export const stakingNominatorInfoActions = slice.actions

export default slice.reducer
