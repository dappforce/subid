import { takeLatest, select, call, put } from '@redux-saga/core/effects'
import { log } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj } from '@subsocial/utils'
import { StakerLedger, StakerLedgerEntity, FetchStakerLedgerProps, stakerLedgerActions, selectStakerLedger } from './stakerLedgerSlice'
import { getStakerLedger } from '../../../../api/creatorStaking'

function* fetchStakerLedgerWorker (
  action: PayloadAction<FetchStakerLedgerProps>
) {
  const { account, reload = false } = action.payload

  try {
    const stakingRewarsdFromStore: StakerLedgerEntity = yield select(selectStakerLedger, account)

    if(!stakingRewarsdFromStore.ledger || isEmptyObj(stakingRewarsdFromStore.ledger) || reload) {
      const result: StakerLedger = yield call(getStakerLedger, account)
      
      if(!result || isEmptyObj(result)) {
        yield put(stakerLedgerActions.fetchStakerLedgerFailed({ account }))
        return
      }
      
      yield put(stakerLedgerActions.fetchStakerLedgerSuccess({
        id: account,
        loading: false,
        ledger: result
      }))
    }
  } catch (error) {
    log.error('Failed to fetch creator ledger by account', account, error)
    yield put(stakerLedgerActions.fetchStakerLedgerFailed({ account }))
  }
}

export function* watchStakerLedger () {
  yield takeLatest(
    stakerLedgerActions.fetchStakerLedger.type,
    fetchStakerLedgerWorker
  )
}
