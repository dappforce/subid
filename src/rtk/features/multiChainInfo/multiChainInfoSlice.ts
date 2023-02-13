import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from '../../app/rootReducer'
import { ChainInfo, MultiChainInfo } from './types'
import { stubFn, hydrateExtraReducer } from '../../app/util'

export type MultiChianInfoEntity = ChainInfo & {
  /** Chain name. */
  id: string
}

const chainInfoAdapter = createEntityAdapter<MultiChianInfoEntity>()

const chianInfoSelector = chainInfoAdapter.getSelectors()

export const selectChainInfoList = (state: RootState) =>
  chianInfoSelector.selectEntities(state.multiChainInfo) as MultiChainInfo

export const selectChainInfoByNetwork = (state: RootState, network: string) =>
  chianInfoSelector.selectById(state.multiChainInfo, network) as ChainInfo

const slice = createSlice({
  name: 'multiChainInfo',
  initialState: chainInfoAdapter.getInitialState(),
  reducers: {
    fetchChainInfo: stubFn,
    fetchStakingConsts: (_state, _action: PayloadAction<string>) => { return },
    fetchStakingConstsSuccess: (
      state,
      action: PayloadAction<MultiChianInfoEntity>
    ) => { chainInfoAdapter.upsertOne(state, action.payload) },
    fetchChainInfoSuccess: (
      state,
      action: PayloadAction<MultiChianInfoEntity[]>
    ) => {
      chainInfoAdapter.upsertMany(state, action.payload)
    },
    fetchChainInfoFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('multiChainInfo')
  },
})

export const chainInfoActions = slice.actions

export default slice.reducer
