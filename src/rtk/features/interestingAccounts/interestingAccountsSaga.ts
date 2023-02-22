import { call, select, takeEvery, put } from '@redux-saga/core/effects'
import { isEmptyObj } from '@subsocial/utils'
import { AccountCardType } from '../../../components/interesting-accounts/types'
import { getAccountsOverviewItems } from 'src/api'
import {
  overviewAccountsActions,
  selectOverviewAccounts,
} from './interestingAccountsSlice'
import { log, toGenericAccountId } from '../../app/util'
import { overviewAccountId } from './interestingAccountsSlice'
import { fetchIdentitiesWorker } from '../identities/identitiesSaga'

// Fetch overview accounts
function* fetchOverviewAccounts () {
  try {
    const chainInfo: AccountCardType[] = yield select(selectOverviewAccounts)

    if (!isEmptyObj(chainInfo)) return

    const response: AccountCardType[] = yield call(getAccountsOverviewItems)

    const addresses = response.map(({ account }) => toGenericAccountId(account))

    yield fetchIdentitiesWorker({ type: '', payload: { accounts: addresses, reload: false } })

    yield put(
      overviewAccountsActions.fetchOverviewAccountsSuccess({
        id: overviewAccountId,
        accounts: response,
      })
    )
  } catch (error) {
    log.error('Failed to fetch overview accounts', error)

    yield put(overviewAccountsActions.fetchOverviewAccountsFailed())
  }
}

export function* watchOverviewAccounts () {
  yield takeEvery(
    overviewAccountsActions.fetchOverviewAccounts.type,
    fetchOverviewAccounts
  )
}
