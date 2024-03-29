import { call, put, select, takeEvery } from '@redux-saga/core/effects'
import { getAccountBalancesByNetwork, getAccountBalances } from 'src/api'
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
import { setBalancesToStore } from '@/components/table/balancesTable/utils'

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
        balances = yield call(getAccountBalances, account)
        setBalancesToStore(account, balances)
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

    yield put(balancesActions.fetchBalancesFailed({ accounts }))
  }
}

function* fetchBalancesByNetwork (
  account: string,
  network: string,
  reload: boolean
) {
  if (!account || !network) return

  const balancesEntity: BalancesEntity = yield select(selectBalances, account)

  if (isEmptyArray(balancesEntity.balances || []) || reload) {
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
  } else {
    return {
      ...balancesEntity,
      loading: false,
    }
  }
}

function* fetchBalancesByNetworkWorker (
  action: PayloadAction<FetchBalanceByNetworkProps>
) {
  const { accounts, network, reload } = action.payload

  if (!network) return

  try {
    const dataMap = accounts.map(function* (account) {
      const accountBalanceByNetwork: any = yield fetchBalancesByNetwork(
        account,
        network,
        reload || true
      )

      return accountBalanceByNetwork
    })

    const newBalances: BalancesEntity[] = yield all(dataMap)

    yield put(balancesActions.fetchBalancesSuccess(newBalances))
  } catch (error) {
    log.error('Failed to fetch balances by network', error)

    yield put(balancesActions.fetchBalancesFailed({ accounts }))
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
