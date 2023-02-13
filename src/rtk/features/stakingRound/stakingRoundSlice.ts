import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { createEntityAdapter } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { stubFn, hydrateExtraReducer } from '../../app/util'
import { Round } from './types'

export const pricesId = 'prices'

type RoundEntity = {
  id: string
  round: Round
}

const stakingRoundAdapter = createEntityAdapter<RoundEntity>()

const stakingRoundSelector = stakingRoundAdapter.getSelectors()

export const selectStakingRound = (state: RootState, network: string) =>
  stakingRoundSelector.selectById(state.stakingRound, network)?.round

const slice = createSlice({
  name: 'stakingRound',
  initialState: stakingRoundAdapter.getInitialState(),
  reducers: {
    fetchStakingRound: (_state, _action: PayloadAction<string>) => { return },
    fetchStakingRoundSuccess (state, action: PayloadAction<RoundEntity>) {
      stakingRoundAdapter.upsertOne(state, action.payload)
    },
    fetchStakingRoundFailed: stubFn
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('stakingRound')
  },
})

export const stakingRoundActions = slice.actions

export default slice.reducer
