import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { createEntityAdapter } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { stubFn, hydrateExtraReducer } from '../../app/util'

export const pricesId = 'prices'

type PricesEntity = {
  id: string
  prices: any[]
}

const pricesAdapter = createEntityAdapter<PricesEntity>()

const pricesSelector = pricesAdapter.getSelectors()

export const selectPrices = (state: RootState) =>
  pricesSelector.selectById(state.prices, pricesId)?.prices

const slice = createSlice({
  name: 'prices',
  initialState: pricesAdapter.getInitialState(),
  reducers: {
    fetchPrices: (_state, _action: PayloadAction<string>) => { return },
    fetchPricesSuccess (state, action: PayloadAction<PricesEntity>) {
      pricesAdapter.upsertOne(state, action.payload)
    },
    fetchPricesFailed: stubFn
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('prices')
  },
})

export const pricesActions = slice.actions

export default slice.reducer
