import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { CrowdloanInfo } from '../../../components/identity/types'
import { HYDRATE } from 'next-redux-wrapper'
import { stubFn, hydrateExtraReducer } from '../../app/util'
import { RelayChain } from '../../../types/index'

export type CrowdloanInfoEntity = {
  /** A relay chain name by which we fetch crowdloan info. */
  id: string
  crowdloanInfo: CrowdloanInfo[]
}

const crowdloanInfoAdapter = createEntityAdapter<CrowdloanInfoEntity>()

const crowdloanInfoSelector = crowdloanInfoAdapter.getSelectors()

export const selectCrowdloanInfo = (state: RootState, relayChain: RelayChain) =>
  crowdloanInfoSelector.selectById(state.crowdloanInfo, relayChain)?.crowdloanInfo

const slice = createSlice({
  name: 'crowdloanInfo',
  initialState: crowdloanInfoAdapter.getInitialState(),
  reducers: {
    fetchCrowdloanInfo: stubFn,
    fetchOneCrowdloanInfoSuccess: (
      state,
      action: PayloadAction<CrowdloanInfoEntity>
    ) => {
      crowdloanInfoAdapter.upsertOne(
        state as EntityState<CrowdloanInfoEntity>,
        action.payload
      )
    },
    fetchManyCrowdloanInfoSuccess: (
      state,
      action: PayloadAction<CrowdloanInfoEntity[]>
    ) => {
      crowdloanInfoAdapter.upsertMany(
        state as EntityState<CrowdloanInfoEntity>,
        action.payload
      )
    },
    fetchCrowdloanInfoFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('crowdloanInfo')
  },
})

export const crowdloanInfoActions = slice.actions

export default slice.reducer
