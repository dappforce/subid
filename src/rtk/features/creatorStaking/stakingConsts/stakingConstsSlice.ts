import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createEntityAdapter } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from '../../../app/rootReducer'
import { hydrateExtraReducer, stubFn } from '../../../app/util'

export const stakingConstsId = 'consts'

export type StakingConsts = {
  unbondingPeriodInEras: string
  minimumStakingAmount: string
  minimumRemainingAmount: string
  maxNumberOfStakersPerCreator: string
}

type StakingConstsEntity = StakingConsts & {
  id: string
}

const stakingConstsAdapter = createEntityAdapter<StakingConstsEntity>()

const stakingConstsSelector = stakingConstsAdapter.getSelectors()

export const selectStakingConsts = (state: RootState) =>
  stakingConstsSelector.selectById(state.creatorStakingConsts, stakingConstsId)

const slice = createSlice({
  name: 'creatorStakingConsts',
  initialState: stakingConstsAdapter.getInitialState(),
  reducers: {
    fetchStakingConsts: stubFn,
    fetchStakingConstsSuccess(state, action: PayloadAction<StakingConstsEntity>) {
      stakingConstsAdapter.upsertOne(state, action.payload)
    },
    fetchStakingConstsFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('creatorStakingConsts'),
  },
})

export const stakingConstsActions = slice.actions

export default slice.reducer
