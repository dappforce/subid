import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, upsertOneEntity } from '../../../app/util'
import { EntityState } from '@reduxjs/toolkit'
import { StakingReward, FetchStakingRewardProps } from './types'

export type StakingRewardEntity = {
  id: string
  loading: boolean
  rewards: StakingReward
}

const stakingRewardAdapter = createEntityAdapter<StakingRewardEntity>()

const stakingRewardSelector = stakingRewardAdapter.getSelectors()

export const selectStakingReward = (state: RootState, account: string, network: string) =>
  stakingRewardSelector.selectById(state.stakingReward, `${account}-${network}`)

const slice = createSlice({
  name: 'stakingReward',
  initialState: stakingRewardAdapter.getInitialState(),
  reducers: {
    fetchStakingReward: (state, action: PayloadAction<FetchStakingRewardProps>) => {
      const { account, reload, network } = action.payload

      const info = stakingRewardSelector.selectById(state, `${account}-${network}`)

      upsertOneEntity({
        adapter: stakingRewardAdapter,
        state: state as EntityState<StakingRewardEntity>,
        reload,
        fieldName: 'rewards',
        id: `${account}-${network}`,
        entity: info,
      })

      return
    },
    fetchStakingRewardSuccess: (state, action: PayloadAction<StakingRewardEntity>) => {
      stakingRewardAdapter.upsertOne(state, action.payload)
    },
    fetcStakingRewardFailed: (state, action: PayloadAction<FetchStakingRewardProps>) => {
      const { account, reload = true, network } = action.payload

      const info = stakingRewardSelector.selectById(state, `${account}-${network}`)

      upsertOneEntity({
        adapter: stakingRewardAdapter,
        state: state as EntityState<StakingRewardEntity>,
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
    [HYDRATE]: hydrateExtraReducer('stakingReward')
  },
})

export const stakingRewardActions = slice.actions

export default slice.reducer
