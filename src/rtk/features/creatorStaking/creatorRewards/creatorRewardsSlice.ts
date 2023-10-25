import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { upsertOneEntity } from '../../../app/util'

type RewardsData = {
  availableClaims: Record<string, string[]>
  rewards: string
} 

export type CreatorRewardsEntity = {
  id: string
  loading: boolean
  data?: RewardsData
}

const creatorRewardsAdapter = createEntityAdapter<CreatorRewardsEntity>()

const creatorRewardsSelector = creatorRewardsAdapter.getSelectors()

export const selectCreatorRewards = (state: RootState, spaceId: string) =>
  creatorRewardsSelector.selectById(state.creatorRewards, spaceId)

export type FetchCreatorRewardsProps = {
  reload?: boolean
  account: string
  spaceIds: string[]
}

const slice = createSlice({
  name: 'creatorRewards',
  initialState: creatorRewardsAdapter.getInitialState(),
  reducers: {
    fetchCreatorRewards: (state, action: PayloadAction<FetchCreatorRewardsProps>) => {
      const { reload, account } = action.payload

      const data = creatorRewardsSelector.selectById(state, account)

      upsertOneEntity({
        adapter: creatorRewardsAdapter,
        state: state as EntityState<CreatorRewardsEntity>,
        reload,
        fieldName: 'data',
        id: account,
        entity: data,
      })
    },
    fetchCreatorRewardsSuccess: (
      state,
      action: PayloadAction<CreatorRewardsEntity>
    ) => {
      creatorRewardsAdapter.upsertOne(
        state as EntityState<CreatorRewardsEntity>,
        action.payload
      )

      return
    },
    fetchCreatorRewardsFailed: (state, action: PayloadAction<FetchCreatorRewardsProps>) => {
      const { account, reload = true } = action.payload

      const data = creatorRewardsSelector.selectById(state, account)

      upsertOneEntity({
        adapter: creatorRewardsAdapter,
        state: state as EntityState<CreatorRewardsEntity>,
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

export const creatorRewardsActions = slice.actions

export default slice.reducer
