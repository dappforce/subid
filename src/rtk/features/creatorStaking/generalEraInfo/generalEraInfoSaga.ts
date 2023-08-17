import { call, put, takeLatest } from '@redux-saga/core/effects'
import { log } from '../../../app/util'
import { 
  GeneralEraInfo, 
  eraInfoId, 
  generalEraInfoActions, 
} from './generalEraInfoSlice'
import { getGeneralEraInfo } from '../../../../api/creatorStaking'

export function* fetchGeneeralEraInfoWorker () {
  try {
    const response: GeneralEraInfo | undefined = yield call(getGeneralEraInfo)

    if (response) {
      yield put(generalEraInfoActions.fetchGeneralEraInfoSuccess({ id: eraInfoId, info: response }))
    }
  } catch (error) {
    log.error('Failed to fetch general era info', error)

    yield put(generalEraInfoActions.fetchGeneralEraInfoFailed())
  }
}

export function* watchGeneralEraInfo () {
  yield takeLatest(generalEraInfoActions.fetchGeneralEraInfo.type, fetchGeneeralEraInfoWorker)
}
