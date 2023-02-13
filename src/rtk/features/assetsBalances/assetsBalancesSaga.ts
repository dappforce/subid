import { call, put, takeEvery, select } from '@redux-saga/core/effects'
import { getAssetsBalancesByAccount } from '../../../components/utils/OffchainUtils'
import { PayloadAction } from '@reduxjs/toolkit'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { AssetsBalances } from './types'
import { AssetsBalancesEntity } from './assetsBalancesSlice'
import { all } from 'redux-saga/effects'
import {
  assetsBalancesActions,
  selectAssetsBalances,
} from './assetsBalancesSlice'
import { FetchProps } from 'src/rtk/app/util'
import { log, isEmptyEntity } from '../../app/util'

function* fetchBalancesWorker (action: PayloadAction<FetchProps>) {
  const { accounts, reload = false } = action.payload

  try {
    if (isEmptyArray(accounts)) return

    const fetchDataMap = accounts.map(function* (account) {
      if (!account) return

      const balancesEntity: AssetsBalances = yield select(
        selectAssetsBalances,
        account
      )

      let assetsBalances = balancesEntity?.assetsBalances

      if (isEmptyEntity(assetsBalances) || reload) {
        assetsBalances = yield call(
          getAssetsBalancesByAccount,
          account
        )
      }

      return {
        id: account,
        loading: false,
        assetsBalances,
      }
    })

    const assetsBalances: AssetsBalancesEntity[] = yield all(fetchDataMap)

    yield put(
      assetsBalancesActions.fetchAssetsBalancesSuccess(
        assetsBalances.filter(isDef)
      )
    )
  } catch (error) {
    log.error('Failed to fetch assets balances by accounts', error)

    yield put(assetsBalancesActions.fetchAssetsBalancesFailed())
  }
}

export function* watchAssetsBalances () {
  yield takeEvery(
    assetsBalancesActions.fetchAssetsBalances.type,
    fetchBalancesWorker
  )
}
