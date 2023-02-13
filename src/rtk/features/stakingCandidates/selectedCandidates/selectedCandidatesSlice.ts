import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, stubFn } from '../../../app/util'

export type SelectedCandidatesEntity = {
   /** A chain name that supports Assets pallet. */
  id: string
  cadidates: string[]
}

const selectedCandidatesAdapter = createEntityAdapter<SelectedCandidatesEntity>()

const selectedCadidatesSelector = selectedCandidatesAdapter.getSelectors()

export const selectselectedCandidates = (state: RootState, network: string) =>
  selectedCadidatesSelector.selectById(state.selectedCandidates, network)?.cadidates

const slice = createSlice({
  name: 'selectedCandidates',
  initialState: selectedCandidatesAdapter.getInitialState(),
  reducers: {
    fetchSelectedCandidates: (_state, _action: PayloadAction<string>) => { return },
    fetchSelectedCandidatesSuccess: (state, action: PayloadAction<SelectedCandidatesEntity>) => {
      selectedCandidatesAdapter.upsertOne(state, action.payload)
    },
    fetchSelectedCandidatesFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('selectedCandidates')
  },
})

export const selectedCandidatesActions = slice.actions

export default slice.reducer