import { takeLatest, select, call, put } from '@redux-saga/core/effects'

import { log, toGenericAccountIds, getIdsThatNeedToFetch } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyArray } from '@subsocial/utils'
import { getDelegatorsStateByNetwork } from 'src/api'
import { StakingDelegatorStateEntityRecord, DelegatorState } from './types'
import {
  FetchCandidatesInfoProps,
  selectStakingDelegatorsState,
  StakingDelegatorStateEntity,
  stakingDelegatorStateActions,
} from './stakingDelegatorsStateSlice'

function* fetchDelegatorStateWorker (
  action: PayloadAction<FetchCandidatesInfoProps>
) {
  const { network, accounts, reload } = action.payload

  try {
    const stakingDelegatorState: StakingDelegatorStateEntityRecord =
      yield select(selectStakingDelegatorsState, network, accounts)

    const needFetch = getIdsThatNeedToFetch(stakingDelegatorState, accounts, 'state')

    const accountsParam: string[] = reload ? accounts : needFetch

    if (!isEmptyArray(accountsParam)) {
      const info: DelegatorState[] = yield call(
        getDelegatorsStateByNetwork,
        network,
        accountsParam
      )

      if (!info || isEmptyArray(info)) {
        yield put(
          stakingDelegatorStateActions.fetchDelegatorStateFailed({
            accounts: toGenericAccountIds(accounts),
            network,
          })
        )
      }

      const delegatorState: StakingDelegatorStateEntity[] = info.map((item) => {
        return {
          id: item.id,
          loading: false,
          state: item,
        }
      })

      yield put(
        stakingDelegatorStateActions.fetchDelegatorStateSuccess(delegatorState)
      )
    }
  } catch (error) {
    log.error('Failed to fetch staking delegator state', error)
  }
}

export function* watchStakingDelegatorState () {
  yield takeLatest(
    stakingDelegatorStateActions.fetchDelegatorState.type,
    fetchDelegatorStateWorker
  )
}
