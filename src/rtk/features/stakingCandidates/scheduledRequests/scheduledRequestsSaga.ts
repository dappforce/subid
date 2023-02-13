import { takeLatest, select, call, put } from '@redux-saga/core/effects'

import { log, toGenericAccountIds, getAccountsThatNeedToFetch } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyArray } from '@subsocial/utils'
import { getScheduledRequestsByNetwork } from '../../../../components/utils/OffchainUtils'
import {
  scheduledRequestsActions,
  ScheduledRequestsEntity,
  FetchScheduledRequestsProps,
  selectManyScheduledRequests,
} from './scheduledRequestsSlice'
import {
  ScheduledRequestsEntityRecord,
  ScheduledRequestByCandidate,
} from './types'

function* fetchScheduledRequestsWorker (
  action: PayloadAction<FetchScheduledRequestsProps>
) {
  const { network, accounts, reload } = action.payload

  try {
    const stakingCandidatesInfo: ScheduledRequestsEntityRecord = yield select(
      selectManyScheduledRequests,
      network,
      accounts
    )

    const needFetch = getAccountsThatNeedToFetch(stakingCandidatesInfo, accounts, 'requests')
    
    const accountsParam: string[] = reload ? accounts : needFetch

    if (!isEmptyArray(accountsParam)) {
      const info: ScheduledRequestByCandidate[] = yield call(
        getScheduledRequestsByNetwork,
        network,
        accountsParam
      )

      if (!info || isEmptyArray(info)) {
        yield put(
          scheduledRequestsActions.fetchScheduledRequestsFailed({
            accounts: toGenericAccountIds(accounts),
            network,
          })
        )
      } else {
        const candidatesInfo: ScheduledRequestsEntity[] = info.map((item) => {
          return {
            id: item.id,
            loading: false,
            requests: item.requests,
          }
        })

        yield put(
          scheduledRequestsActions.fetchScheduledRequestsSuccess(candidatesInfo)
        )
      }
    }
  } catch (error) {
    log.error('Failed to fetch staking delegator state', error)
  }
}

export function* watchScheduledRequests () {
  yield takeLatest(
    scheduledRequestsActions.fetchScheduledRequests.type,
    fetchScheduledRequestsWorker
  )
}
