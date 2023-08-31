import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from '../../../app/rootReducer';
import { hydrateExtraReducer, upsertOneEntity } from '../../../app/util'

export type StakerRewards = {
  totalRewards: string
  spaceIds: string[]
}

export type StakerRewardsEntity = {
  id: string
  loading: boolean
  rewards?: StakerRewards
}

const stakerRewardsAdapter = createEntityAdapter<StakerRewardsEntity>()

const stakerStakerRewardsSelector = stakerRewardsAdapter.getSelectors()

export const selectStakerRewards = (state: RootState, account: string) =>
  stakerStakerRewardsSelector.selectById(state.stakerRewards, account)

export type FetchStakerRewardsProps = {
  reload?: boolean
  account: string
  spaceIds: string[]
}

const slice = createSlice({
  name: 'stakerRewards',
  initialState: stakerRewardsAdapter.getInitialState(),
  reducers: {
    fetchStakerRewards: (state, action: PayloadAction<FetchStakerRewardsProps>) => {
      const { reload, account } = action.payload

      const rewards = stakerStakerRewardsSelector.selectById(state, account)

      upsertOneEntity({
        adapter: stakerRewardsAdapter,
        state: state as EntityState<StakerRewardsEntity>,
        reload,
        fieldName: 'rewards',
        id: account,
        entity: rewards,
      })
    },
    fetchStakerRewardsSuccess: (
      state,
      action: PayloadAction<StakerRewardsEntity>
    ) => {
      stakerRewardsAdapter.upsertOne(
        state as EntityState<StakerRewardsEntity>,
        action.payload
      )
    },
    fetchStakerRewardsFailed: (state, action: PayloadAction<FetchStakerRewardsProps>) => {
      const { account, reload = true } = action.payload

      const rewards = stakerStakerRewardsSelector.selectById(state, account)

      upsertOneEntity({
        adapter: stakerRewardsAdapter,
        state: state as EntityState<StakerRewardsEntity>,
        reload,
        loading: false,
        fieldName: 'rewards',
        id: account,
        entity: rewards,
      })
      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('stakerRewards')
  },
})

export const stakerRewardsActions = slice.actions

export default slice.reducer
