import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects'
import { getVestingData } from '../../../components/utils/OffchainUtils'
import { PayloadAction } from '@reduxjs/toolkit'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { all } from 'redux-saga/effects'
import { FetchProps } from 'src/rtk/app/util'
import { log } from '../../app/util'
import { selectVesting, vestingActions, VestingEntity, VestingRecord } from './vestingSlice'

export type FetchVestingProps = FetchProps & {
  networks: string[]
}

function* fetchVestingByAccounts (action: PayloadAction<FetchVestingProps>) {
  const { accounts, networks, reload = false } = action.payload

  const fetchDataMap = accounts.map(function* (account) {
    if (!account) return

    const shouldFetchedNetworks: string[] = []
    const checkCacheMap = networks.map(function* (network) {
      const vestingEntity: VestingEntity | undefined = yield select(
        selectVesting,
        account,
        network
      )
      if (!vestingEntity?.vestingData || reload) {
        shouldFetchedNetworks.push(network)
      }
    })
    yield all(checkCacheMap)

    if (isEmptyArray(shouldFetchedNetworks)) return []

    const vestingRecords: VestingRecord = yield call(getVestingData, {
      account,
      networks: shouldFetchedNetworks,
      noCache: reload
    })

    return Object.entries(vestingRecords).map<VestingEntity>(([ network, record ]) => {
      return {
        id: `${account}-${network}`,
        loading: false,
        vestingData: record,
      }
    })
  })

  const vestingEntities: VestingEntity[][] = yield all(fetchDataMap)
  const flattenedEntities = vestingEntities.reduce<VestingEntity[]>((acc, entities) => {
    acc.push(...entities)
    return acc
  }, [])

  return flattenedEntities.filter(isDef)
}

function* fetchVestingByAccountsWorker (
  action: PayloadAction<FetchVestingProps>
) {
  try {
    if (isEmptyArray(action.payload.accounts)) return

    const vestingData: VestingEntity[] = yield fetchVestingByAccounts(
      action
    )

    yield put(
      vestingActions.fetchVestingSuccess(
        vestingData
      )
    )
  } catch (error) {
    log.error('Failed to fetch vesting', error)

    yield put(vestingActions.fetchVestingFailed())
  }
}

export function* watchVestings () {
  yield takeEvery(
    vestingActions.fetchVesting.type,
    fetchVestingByAccountsWorker
  )
}
