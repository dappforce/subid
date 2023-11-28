import {
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { createEntityAdapter } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, upsertOneEntity } from '../../app/util'

export const pricesId = 'prices'

export type PricesData = {
  prices: any[]
  isCachedData?: boolean
  lastUpdate?: string
}

export type PricesEntity = {
  id: string
  loading: boolean
  pricesData: PricesData
}

const pricesAdapter = createEntityAdapter<PricesEntity>()

const pricesSelector = pricesAdapter.getSelectors()

export const selectPrices = (state: RootState) =>
  pricesSelector.selectById(state.prices, pricesId)

const slice = createSlice({
  name: 'prices',
  initialState: pricesAdapter.getInitialState(),
  reducers: {
    fetchPrices: (state, _action: PayloadAction<string>) => { 
      const pricesEntity = pricesSelector.selectById(state, pricesId)

        upsertOneEntity({
          adapter: pricesAdapter,
          state: state as EntityState<PricesEntity>,
          reload: true,
          fieldName: 'prices',
          id: pricesId,
          entity: pricesEntity,
        })
     },
    fetchPricesSuccess (state, action: PayloadAction<PricesEntity>) {
      pricesAdapter.upsertOne(state, action.payload)
    },
    fetchPricesFailed: (state, _action: PayloadAction<string>) => {
      const pricesEntity = pricesSelector.selectById(state, pricesId)

      upsertOneEntity({
        adapter: pricesAdapter,
        state: state as EntityState<PricesEntity>,
        reload: true,
        loading: false,
        fieldName: 'prices',
        id: pricesId,
        entity: pricesEntity,
      })
    }
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('prices')
  },
})

export const pricesActions = slice.actions

export default slice.reducer
