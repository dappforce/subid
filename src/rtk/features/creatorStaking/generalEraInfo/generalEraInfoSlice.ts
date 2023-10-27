import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'
import { createEntityAdapter } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, upsertOneEntity } from '../../../app/util'
import { RootState } from '../../../app/rootReducer'

export type GeneralEraInfoProps = {
  reload?: boolean
}

export const eraInfoId = 'eraInfo'

export type GeneralEraInfo = {
  currentEra: string
  nextEraBlock: string
  blockPerEra: string
  backerCount: string
  rewards: {
    stakers: string
    creators: string
  }
  staked: string
  locked: string
}

export type GeneralErainfoEntity = {
  id: string
  loading: boolean
  info: GeneralEraInfo
}

const generalEraInfoAdapter = createEntityAdapter<GeneralErainfoEntity>()

const generalEraInfoSelector = generalEraInfoAdapter.getSelectors()

export const selectGeneralEraInfo = (state: RootState) =>
  generalEraInfoSelector.selectById(state.generalEraInfo, eraInfoId)

const slice = createSlice({
  name: 'generalEraInfo',
  initialState: generalEraInfoAdapter.getInitialState(),
  reducers: {
    fetchGeneralEraInfo: (state, action: PayloadAction<GeneralEraInfoProps>) => {
      const { reload } = action.payload

      const data = generalEraInfoSelector.selectById(state, eraInfoId)

      upsertOneEntity({
        adapter: generalEraInfoAdapter,
        state: state as EntityState<GeneralErainfoEntity>,
        reload,
        fieldName: 'info',
        id: eraInfoId,
        entity: data,
      })
    },
    fetchGeneralEraInfoSuccess (
      state,
      action: PayloadAction<GeneralErainfoEntity>
    ) {
      generalEraInfoAdapter.upsertOne(state, action.payload)
    },
    fetchGeneralEraInfoFailed: (state, _action: PayloadAction<GeneralEraInfoProps>) => {

      const data = generalEraInfoSelector.selectById(state, eraInfoId)

      upsertOneEntity({
        adapter: generalEraInfoAdapter,
        state: state as EntityState<GeneralErainfoEntity>,
        loading: false,
        fieldName: 'info',
        id: eraInfoId,
        entity: data,
      })
      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('generalEraInfo'),
  },
})

export const generalEraInfoActions = slice.actions

export default slice.reducer
