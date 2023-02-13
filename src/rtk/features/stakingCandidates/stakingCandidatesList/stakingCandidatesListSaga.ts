import { call, put, takeLatest, select } from '@redux-saga/core/effects'
import { isEmptyObj, isEmptyArray } from '@subsocial/utils'
import { getCandidatesListByNetwork } from '../../../../components/utils/OffchainUtils'
import { log, toGenericAccountIds } from '../../../app/util'
import { fetchIdentitiesWorker } from '../../identities/identitiesSaga'
import { PayloadAction } from '@reduxjs/toolkit'
import {
  candidatesListActions,
  selectCandidatesList,
} from './stakingCandidatesListSlice'

function* fetchCandidatesListWorker (action: PayloadAction<string>) {
  const network = action.payload as string

  try {
    if(!network) return

    const candidates: string[] = yield select(selectCandidatesList, network)

    if (!isEmptyObj(candidates)) return

    const response: string[] = yield call(getCandidatesListByNetwork, network)

    yield fetchIdentitiesWorker({
      payload: { accounts: toGenericAccountIds(response), reload: false },
      type: '',
    })

    if (isEmptyArray(response)) return

    yield put(
      candidatesListActions.fetchCandidatesListSuccess({
        id: network,
        cadidates: response,
      })
    )
  } catch (error) {
    log.error('Failed to fetch staking candidates list', error)
  }
}

export function* watchCandidatesList () {
  yield takeLatest(
    candidatesListActions.fetchCandidatesList.type,
    fetchCandidatesListWorker
  )
}
