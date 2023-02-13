import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects'
import { getCrowdloans } from '../../../components/utils/OffchainUtils'
import { PayloadAction } from '@reduxjs/toolkit'
import { isDef, isEmptyArray } from '@subsocial/utils'
import {
  selectContributions,
  contributionsActions,
  ContributionsEntity,
} from './contributionsSlice'
import { CrowdloanContributions } from './types'
import { all } from 'redux-saga/effects'
import { FetchProps } from 'src/rtk/app/util'
import { RelayChain } from '../../../types/index'
import { log, isEmptyEntity } from '../../app/util'

export type FetchContributionProps = FetchProps & {
  relayChain: RelayChain
}

export type FetchContributionPropsByRelayChains = FetchProps & {
  relayChains: RelayChain[]
}

export const FETCH_DOTSAMA_CONTRIBUTIONS = 'FETCH_DOTSAMA_CONTRIBUTIONS'

function* fetchContributionsByRelayChain (action: PayloadAction<FetchContributionProps>) {
  const { accounts, relayChain, reload = false } = action.payload

  const fetchDataMap = accounts.map(function* (account) {
    if (!account) return

    const balancesEntity: CrowdloanContributions = yield select(
      selectContributions,
      account,
      relayChain
    )

    let contributions = balancesEntity?.contributions

    if (isEmptyEntity(contributions) || reload) {
      contributions = yield call(getCrowdloans, {
        account,
        relayChain,
      })
    }

    return {
      id: `${account}-${relayChain}`,
      loading: false,
      contributions: contributions,
    }
  })

  const contributions: ContributionsEntity[] = yield all(fetchDataMap)

  return contributions.filter(isDef)
}

function* fetchContributionsByAccountsWorker (
  action: PayloadAction<FetchContributionProps>
) {
  try {
    if (isEmptyArray(action.payload.accounts)) return

    const contributions: ContributionsEntity[] = yield fetchContributionsByRelayChain(
      action
    )

    yield put(
      contributionsActions.fetchContributionsSuccess(
        contributions.filter(isDef)
      )
    )
  } catch (error) {
    log.error('Failed to fetch contributions', error)

    yield put(contributionsActions.fetchContributionsFailed())
  }
}

export function* watchContributions () {
  yield takeEvery(
    contributionsActions.fetchContributions.type,
    fetchContributionsByAccountsWorker
  )
}

function* fetchDotsamaContributionsWorker (
  action: PayloadAction<FetchContributionPropsByRelayChains>
) {
  const { accounts, relayChains } = action.payload

  const fetchDataMap = relayChains.map(function* (relayChain) {
    const contributions: ContributionsEntity[] = yield fetchContributionsByRelayChain({
      type: '',
      payload: { accounts, relayChain },
    })

    return contributions
  })

  const contributions: ContributionsEntity[][] = yield all(fetchDataMap)

  const flatContributionsArray = contributions.filter(isDef).flat()

  yield put(
    contributionsActions.fetchContributionsSuccess(flatContributionsArray)
  )
}

export function* watchDotsamaContributions () {
  yield takeEvery(FETCH_DOTSAMA_CONTRIBUTIONS, fetchDotsamaContributionsWorker)
}
