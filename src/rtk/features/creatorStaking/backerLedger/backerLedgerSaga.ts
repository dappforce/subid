import { takeLatest, select, call, put } from '@redux-saga/core/effects'
import { log } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj } from '@subsocial/utils'
import { BackerLedger, BackerLedgerEntity, FetchBackerLedgerProps, backerLedgerActions, selectBackerLedger } from './backerLedgerSlice'
import { getBackerLedger } from '../../../../api/creatorStaking'
import BN from 'bignumber.js'

function* fetchBackerLedgerWorker (
  action: PayloadAction<FetchBackerLedgerProps>
) {
  const { account, reload = false } = action.payload

  try {
    const stakingRewarsdFromStore: BackerLedgerEntity = yield select(selectBackerLedger, account)

    if(!stakingRewarsdFromStore.ledger || isEmptyObj(stakingRewarsdFromStore.ledger) || reload) {
      const result: BackerLedger = yield call(getBackerLedger, account)
      
      if(!result || isEmptyObj(result)) {
        yield put(backerLedgerActions.fetchBackerLedgerFailed({ account }))
        return
      }

      let lockedBN = new BN(result.totalLocked)
      
      result.unbondingInfo.unlockingChunks.forEach(({ amount }) => {
        lockedBN = lockedBN.minus(amount)
      })

      const backerLedger = {
        ...result,
        locked: lockedBN.toString(),
      }
      
      yield put(backerLedgerActions.fetchBackerLedgerSuccess({
        id: account,
        loading: false,
        ledger: backerLedger
      }))
    }
  } catch (error) {
    log.error('Failed to fetch creator ledger by account', account, error)
    yield put(backerLedgerActions.fetchBackerLedgerFailed({ account }))
  }
}

export function* watchBackerLedger () {
  yield takeLatest(
    backerLedgerActions.fetchBackerLedger.type,
    fetchBackerLedgerWorker
  )
}
