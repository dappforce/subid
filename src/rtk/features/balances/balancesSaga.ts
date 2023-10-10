import { call, put, select, takeEvery } from '@redux-saga/core/effects'
import {
  getAccountInfo,
  getAccountBalancesByNetwork,
} from 'src/api'
import { PayloadAction } from '@reduxjs/toolkit'
import { isDef, isEmptyArray } from '@subsocial/utils'
import {
  selectBalances,
  balancesActions,
  BalancesEntity,
  FetchBalanceByNetworkProps,
} from './balancesSlice'
import { all } from 'redux-saga/effects'
import { FetchProps, log, isEmptyEntity } from '../../app/util'
import { AccountInfoItem } from 'src/components/identity/types'

function* fetchBalancesWorker (action: PayloadAction<FetchProps>) {
  const { accounts, reload = false } = action.payload

  try {
    if (isEmptyArray(accounts)) return

    const fetchDataMap = accounts.map(function* (account) {
      if (!account) return

      const balancesEntity: BalancesEntity = yield select(
        selectBalances,
        account
      )

      let balances = balancesEntity?.balances

      if (isEmptyEntity(balances) || reload) {
        balances = yield call(getAccountInfo, account)
      }

      return {
        id: account,
        loading: false,
        balances,
      }
    })

    const balances: BalancesEntity[] = yield all(fetchDataMap)

    yield put(balancesActions.fetchBalancesSuccess(balances.filter(isDef)))
  } catch (error) {
    log.error('Failed to fetch balances', error)

    yield put(balancesActions.fetchBalancesFailed())
  }
}

function* fetchBalancesByNetwork (account: string, network: string) {
  if (!account || !network) return

  const balancesEntity: BalancesEntity = yield select(selectBalances, account)

  const balancesByNetwork: AccountInfoItem = yield call(
    getAccountBalancesByNetwork,
    { account, network }
  )

  const augmentedBalances = [ ...(balancesEntity.balances ?? []) ]
  let found = false
  for (let i = 0; i < augmentedBalances.length; i++) {
    const balance = augmentedBalances[i]
    if (balance.network === network) {
      augmentedBalances[i] = balancesByNetwork
      found = true
      break
    }
  }
  if (!found) {
    augmentedBalances.push(balancesByNetwork)
  }

  return {
    ...balancesEntity,
    balances: augmentedBalances,
    loading: false,
  }
}

function* fetchBalancesByNetworkWorker (
  action: PayloadAction<FetchBalanceByNetworkProps>
) {
  const { accounts, network } = action.payload

  if (!network) return

  try {
    const dataMap = accounts.map(function* (account) {
      const accountBalanceByNetwork: any = yield fetchBalancesByNetwork(account, network)

      return accountBalanceByNetwork
    })

    const newBalances: BalancesEntity[] = yield all(dataMap)

    yield put(balancesActions.fetchBalancesSuccess(newBalances))
  } catch (error) {
    log.error('Failed to fetch balances by network', error)

    yield put(balancesActions.fetchBalancesFailed())
  }
}

export function* watchBalances () {
  yield takeEvery(balancesActions.fetchBalances.type, fetchBalancesWorker)
}

export function* watchBalancesByNetwork () {
  yield takeEvery(
    balancesActions.fetchBalanceByNetwork.type,
    fetchBalancesByNetworkWorker
  )
}
