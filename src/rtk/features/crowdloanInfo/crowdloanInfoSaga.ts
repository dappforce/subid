import { call, put, takeLatest, select } from '@redux-saga/core/effects'
import { getCrowdloansInfoByRelayChain } from 'src/api'
import { isDef, isEmptyObj, isEmptyArray } from '@subsocial/utils'
import {
  selectCrowdloanInfo,
  crowdloanInfoActions,
  CrowdloanInfoEntity,
} from './crowdloanInfoSlice'
import { CrowdloanInfo } from '../../../components/identity/types'
import { PayloadAction } from '@reduxjs/toolkit'
import { RelayChain } from '../../../types/index'
import { all } from 'redux-saga/effects'
import { log } from '../../app/util'
import { FETCH_DOTSAMA_CROWDLOAN_INFO } from '../../app/actions'

function* fetchDotsamaCrowdloanInfoWorker (action: PayloadAction<RelayChain[]>) {
  const relayChains = action.payload

  try {
    const fetchDataMap = relayChains.map(function* (relayChain) {
      const crowdloanInfo: CrowdloanInfo[] = yield select(
        selectCrowdloanInfo,
        relayChain
      )

      if (!isEmptyObj(crowdloanInfo)) return

      const response: CrowdloanInfo[] = yield call(
        getCrowdloansInfoByRelayChain,
        relayChain
      )

      return { id: relayChain, crowdloanInfo: response }
    })

    const crowdloanInfoEntities: CrowdloanInfoEntity[] = yield all(fetchDataMap)

    const crowdloanInfoEntitiesFiltered = crowdloanInfoEntities.filter(isDef)

    if (isEmptyArray(crowdloanInfoEntitiesFiltered)) return

    yield put(
      crowdloanInfoActions.fetchManyCrowdloanInfoSuccess(
        crowdloanInfoEntitiesFiltered
      )
    )
  } catch (error) {
    log.error('Failed to fetch info of crowdloans by relay chains', error)
  }
}

export function* watchDotsamaCrowdloanInfo () {
  yield takeLatest(
    FETCH_DOTSAMA_CROWDLOAN_INFO,
    fetchDotsamaCrowdloanInfoWorker
  )
}
