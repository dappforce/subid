import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, stubFn } from '../../../app/util'

export type CandidatesListEntity = {
   /** A chain name that supports Assets pallet. */
  id: string
  cadidates: string[]
}

const candidatesListAdapter = createEntityAdapter<CandidatesListEntity>()

const cadidatesListSelector = candidatesListAdapter.getSelectors()

export const selectCandidatesList = (state: RootState, network: string) =>
  cadidatesListSelector.selectById(state.candidatesList, network)?.cadidates

const slice = createSlice({
  name: 'candidatesList',
  initialState: candidatesListAdapter.getInitialState(),
  reducers: {
    fetchCandidatesList: (_state, _action: PayloadAction<string>) => { return },
    fetchCandidatesListSuccess: (state, action: PayloadAction<CandidatesListEntity>) => {
      candidatesListAdapter.upsertOne(state, action.payload)
    },
    fetchCandidatesListFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('candidatesList')
  },
})

export const candidatesListActions = slice.actions

export default slice.reducer