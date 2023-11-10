import { call, put, takeLeading, select } from '@redux-saga/core/effects'
import { log } from '../../../app/util'
import { 
  GeneralEraInfo, 
  GeneralEraInfoProps, 
  GeneralErainfoEntity, 
  eraInfoId, 
  generalEraInfoActions,
  selectGeneralEraInfo, 
} from './generalEraInfoSlice'
import { getGeneralEraInfo } from '../../../../api/creatorStaking'
import { PayloadAction } from '@reduxjs/toolkit'

export function* fetchGeneeralEraInfoWorker (action: PayloadAction<GeneralEraInfoProps>) {
  const { reload } = action.payload

  try {
    const selectedData: GeneralErainfoEntity = yield select(selectGeneralEraInfo)

    if(!selectedData?.info || reload) {
      const response: GeneralEraInfo | undefined = yield call(getGeneralEraInfo)
  
      if (response) {
        yield put(generalEraInfoActions.fetchGeneralEraInfoSuccess({ id: eraInfoId, loading: false, info: response }))
      }
    }
  } catch (error) {
    log.error('Failed to fetch general era info', error)

    yield put(generalEraInfoActions.fetchGeneralEraInfoFailed({}))
  }
}

export function* watchGeneralEraInfo () {
  yield takeLeading(generalEraInfoActions.fetchGeneralEraInfo.type, fetchGeneeralEraInfoWorker)
}
