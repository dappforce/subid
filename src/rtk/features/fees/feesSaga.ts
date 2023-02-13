import { call, put, takeLatest, select } from '@redux-saga/core/effects'
import { getTransferFee } from '../../../components/utils/OffchainUtils'
import {
  selectFee,
  feesActions,
  FetchTransferFeeParams,
  FeesEntity,
  FeeData,
} from './feesSlice'
import { PayloadAction } from '@reduxjs/toolkit'
import { log } from '../../app/util'
import { generateTransferFeeId } from './utils'

function* fetchTransferFee (action: PayloadAction<FetchTransferFeeParams>) {
  const { reload, ...params } = action.payload
  try {
    if (!reload) {
      const data: FeesEntity | undefined = yield select(selectFee, generateTransferFeeId(params))
      if (data?.fee) return
    }
    const fee: FeeData = yield call(getTransferFee, params.token, params.source, params.dest)
    yield put(feesActions.fetchTransferFeeSuccess({ id: generateTransferFeeId(params), loading: false, fee }))
  } catch (error) {
    log.error('Failed to fetch transfer fee', error)
  }
}

export function* watchTransferFee () {
  yield takeLatest(
    feesActions.fetchTransferFee.type,
    fetchTransferFee,
  )
}
