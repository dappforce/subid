import { call, put, takeLatest } from '@redux-saga/core/effects'
import { getTokenPrice } from 'src/api'
import { PayloadAction } from '@reduxjs/toolkit'
import { PricesData, pricesActions, pricesId } from './pricesSlice'
import { log } from '../../app/util'

export function* fetchPricesWorker (action: PayloadAction<string>) {
  try {
    const response: PricesData = yield call(getTokenPrice, action.payload)

    yield put(
      pricesActions.fetchPricesSuccess({
        id: pricesId,
        loading: false,
        pricesData: response,
      })
    )
  } catch (error) {
    log.error('Failed to fetch prices from CoinGecko', error)

    yield put(pricesActions.fetchPricesFailed(pricesId))
  }
}

export function* watchPrices () {
  yield takeLatest(pricesActions.fetchPrices.type, fetchPricesWorker)
}
