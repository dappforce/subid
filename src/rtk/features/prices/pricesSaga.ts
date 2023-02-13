import { call, put, takeLatest } from '@redux-saga/core/effects'
import { getTokenPrice } from '../../../components/utils/OffchainUtils'
import { PayloadAction } from '@reduxjs/toolkit'
import { pricesActions, pricesId } from './pricesSlice'
import { log } from '../../app/util'

export function* fetchPricesWorker (action: PayloadAction<string>) {
  try {
    const response: any[] | undefined = yield call(getTokenPrice, action.payload)

    yield put(pricesActions.fetchPricesSuccess({ id: pricesId, prices: response || [] }))
  } catch (error) {
    log.error('Failed to fetch prices from CoinGecko', error)

    yield put(pricesActions.fetchPricesFailed())
  }
}

export function* watchPrices () {
  yield takeLatest(pricesActions.fetchPrices.type, fetchPricesWorker)
}
