import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer } from '../../app/util'

export type NetworkByParaId = Record<string, string>

export type NetworkByParaIdEntity = {
  networkByParaId: NetworkByParaId
}

const initialState: NetworkByParaIdEntity = {
  networkByParaId: {}
}

const slice = createSlice({
  name: 'networkByParaId',
  initialState,
  reducers: {
    storeNetworkByParaId: (state, action: PayloadAction<NetworkByParaId>) => {
      state.networkByParaId = action.payload
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('networkByParaId')
  },
})

export const networkByParaIdActions = slice.actions

export default slice.reducer