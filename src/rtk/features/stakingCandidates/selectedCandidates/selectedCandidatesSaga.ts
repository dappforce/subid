import { call, put, takeLatest, select } from '@redux-saga/core/effects'
import { isEmptyObj, isEmptyArray } from '@subsocial/utils'
import { getSelectedCandidatesByNetwork } from 'src/api'
import { log } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import {
  selectedCandidatesActions,
  selectselectedCandidates,
} from './selectedCandidatesSlice'

function* fetchSelectedCandidatesWorker (action: PayloadAction<string>) {
  const network = action.payload

  try {
    if(!network) return

    const selectedCandidates: string[] = yield select(
      selectselectedCandidates,
      network
    )

    if (!isEmptyObj(selectedCandidates)) return

    const response: string[] = yield call(
      getSelectedCandidatesByNetwork,
      network
    )

    if (isEmptyArray(response)) return

    yield put(
      selectedCandidatesActions.fetchSelectedCandidatesSuccess({
        id: network,
        cadidates: response,
      })
    )
  } catch (error) {
    log.error('Failed to fetch selected staking candidates', error)
  }
}

export function* watchSelectedCandidates () {
  yield takeLatest(
    selectedCandidatesActions.fetchSelectedCandidates.type,
    fetchSelectedCandidatesWorker
  )
}
