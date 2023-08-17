import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, stubFn } from '../../../app/util'

type RegisteredState = 'Registered' | 'Unregistered'

export type RegisteredCreator = {
  spaceId: string
  stakeholder: string
  state: RegisteredState
}

export type CreatorsListEntity = {
   /** A chain name that supports Assets pallet. */
  id: string
  creator: RegisteredCreator
}

const creatorsListAdapter = createEntityAdapter<CreatorsListEntity>()

const creatorsListSelector = creatorsListAdapter.getSelectors()

export const selectCreatorsList = (state: RootState) =>
  creatorsListSelector.selectAll(state.creatorsList)

const slice = createSlice({
  name: 'creatorsList',
  initialState: creatorsListAdapter.getInitialState(),
  reducers: {
    fetchCreatorsList: (_state, _action: PayloadAction) => { return },
    fetchCreatorsListSuccess: (state, action: PayloadAction<CreatorsListEntity[]>) => {
      creatorsListAdapter.upsertMany(state, action.payload)
    },
    fetchCreatorsListFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('creatorsList')
  },
})

export const creatorsListActions = slice.actions

export default slice.reducer