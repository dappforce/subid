import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from '../../../app/rootReducer'
import { hydrateExtraReducer, upsertOneEntity } from '../../../app/util'

export type BackerRewards = {
  totalRewards: string
  spaceIds: string[]
}

type RewardsData = {
  availableClaimsBySpaceId: Record<string, string>
  rewards: BackerRewards
} 

export type BackerRewardsEntity = {
  id: string
  loading: boolean
  data?: RewardsData
}

const backerRewardsAdapter = createEntityAdapter<BackerRewardsEntity>()

const backerBackerRewardsSelector = backerRewardsAdapter.getSelectors()

export const selectBackerRewards = (state: RootState, account: string) =>
  backerBackerRewardsSelector.selectById(state.backerRewards, account)

export type FetchBackerRewardsProps = {
  reload?: boolean
  account: string
  spaceIds: string[]
}

const slice = createSlice({
  name: 'backerRewards',
  initialState: backerRewardsAdapter.getInitialState(),
  reducers: {
    fetchBackerRewards: (state, action: PayloadAction<FetchBackerRewardsProps>) => {
      const { reload, account } = action.payload

      const data = backerBackerRewardsSelector.selectById(state, account)

      upsertOneEntity({
        adapter: backerRewardsAdapter,
        state: state as EntityState<BackerRewardsEntity>,
        reload,
        fieldName: 'data',
        id: account,
        entity: data,
      })
    },
    fetchBackerRewardsSuccess: (
      state,
      action: PayloadAction<BackerRewardsEntity>
    ) => {
      backerRewardsAdapter.upsertOne(
        state as EntityState<BackerRewardsEntity>,
        action.payload
      )
      return
    },
    fetchBackerRewardsFailed: (state, action: PayloadAction<FetchBackerRewardsProps>) => {
      const { account, reload = true } = action.payload

      const data = backerBackerRewardsSelector.selectById(state, account)

      upsertOneEntity({
        adapter: backerRewardsAdapter,
        state: state as EntityState<BackerRewardsEntity>,
        reload,
        loading: false,
        fieldName: 'data',
        id: account,
        entity: data,
      })
      return
    },
  },
})

export const backerRewardsActions = slice.actions

export default slice.reducer
