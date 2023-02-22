import { call, put, select, takeEvery } from '@redux-saga/core/effects'
import { log, toGenericAccountIds, getAccountsThatNeedToFetch } from '../../app/util'
import {
  identitiesActions,
  IdentitiesEntity,
} from './identitiesSlice'
import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj, isEmptyArray } from '@subsocial/utils'
import { FetchProps } from 'src/rtk/app/util'
import { selectManyIdentities, AccountIdentitiesRecord } from './identitiesSlice'
import { getAccountIdentities } from 'src/api'

export function* fetchIdentitiesWorker (action: PayloadAction<FetchProps>) {
  const { accounts, reload = false } = action.payload

  try {
    const identitesEntityByAccounts: AccountIdentitiesRecord = yield select(
      selectManyIdentities,
      accounts
    )

    const needFetch = getAccountsThatNeedToFetch(identitesEntityByAccounts, accounts)

    const accountsParam: string[] = reload ? accounts : needFetch
    
    if (!isEmptyArray(accountsParam)) {
      const info: Record<string, any> = yield call(
        getAccountIdentities,
        accountsParam
      )

      if (!info || isEmptyObj(info)) {
        yield put(
          identitiesActions.fetchIdentitiesFailed({
            accounts: toGenericAccountIds(accounts),
          })
        )
        return
      }

      const candidatesInfo: IdentitiesEntity[] = Object.entries(info).map(([ key, item ]) => {
        return {
          id: key,
          loading: false,
          identity: item,
        }
      })


      yield put(
        identitiesActions.fetchIdentitiesSuccess(candidatesInfo)
      )
    }
  } catch (error) {
    log.error('Failed to fetch identity', error)
  }
}

export function* watchIdentities () {
  yield takeEvery(identitiesActions.fetchIdentities.type, fetchIdentitiesWorker)
}
