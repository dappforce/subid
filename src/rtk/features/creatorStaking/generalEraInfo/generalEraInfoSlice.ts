import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createEntityAdapter } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, stubFn } from '../../../app/util'
import { RootState } from '../../../app/rootReducer'

export const eraInfoId = 'eraInfo'

export type GeneralEraInfo = {
  currentEra: string
  nextEraBlock: string
  rewards: {
    stakers: string
    creators: string
  }
  staked: string
  locked: string
}

type GeneralErainfoEntity = {
  id: string
  info: GeneralEraInfo
}

const generalEraInfoAdapter = createEntityAdapter<GeneralErainfoEntity>()

const generalEraInfoSelector = generalEraInfoAdapter.getSelectors()

export const selectGeneralEraInfo = (state: RootState) =>
  generalEraInfoSelector.selectById(state.generalEraInfo, eraInfoId)?.info

const slice = createSlice({
  name: 'generalEraInfo',
  initialState: generalEraInfoAdapter.getInitialState(),
  reducers: {
    fetchGeneralEraInfo: (_state, _action: PayloadAction) => {
      return
    },
    fetchGeneralEraInfoSuccess(
      state,
      action: PayloadAction<GeneralErainfoEntity>
    ) {
      generalEraInfoAdapter.upsertOne(state, action.payload)
    },
    fetchGeneralEraInfoFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('generalEraInfo'),
  },
})

export const generalEraInfoActions = slice.actions

export default slice.reducer
