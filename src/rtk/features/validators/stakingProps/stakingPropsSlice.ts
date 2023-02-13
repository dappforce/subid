import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { createEntityAdapter } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { stubFn, hydrateExtraReducer } from '../../../app/util'

export const pricesId = 'prices'

export type StakingProps = {
  bondingDuration: string
  minNominatorBond: string
  maxNominations: string
  historyDepth: string
  epochDuration: string
  sessionsPerEra: string
  maxNominatorRewardedPerValidator: string
}

type ValidatorStakingPropsEntity = {
  id: string
  props: StakingProps
}

const stakingPropsAdapter = createEntityAdapter<ValidatorStakingPropsEntity>()

const stakingPropsSelector = stakingPropsAdapter.getSelectors()

export const selectStakingProps = (state: RootState, network: string): StakingProps | undefined =>
  stakingPropsSelector.selectById(state.stakingProps, network)?.props

const slice = createSlice({
  name: 'stakingProps',
  initialState: stakingPropsAdapter.getInitialState(),
  reducers: {
    fetchStakingProps: (_state, _action: PayloadAction<string>) => { return },
    fetchStakingPropsSuccess (state, action: PayloadAction<ValidatorStakingPropsEntity>) {
      stakingPropsAdapter.upsertOne(state, action.payload)
    },
    fetchStakingPropsFailed: stubFn
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('stakingProps')
  },
})

export const stakingPropsActions = slice.actions

export default slice.reducer
