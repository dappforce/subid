import { call, put, takeLatest } from '@redux-saga/core/effects'
import { getStakingRoundByNetwork } from 'src/api'
import { PayloadAction } from '@reduxjs/toolkit'
import { log } from '../../app/util'
import { stakingRoundActions } from './stakingRoundSlice'
import { Round } from './types'

export function* fetchStakingRoundWorker (action: PayloadAction<string>) {
  const network = action.payload

  try {

    const response: Round = yield call(getStakingRoundByNetwork, network)

    yield put(stakingRoundActions.fetchStakingRoundSuccess({ id: network, round: response }))
  } catch (error) {
    log.error(`Failed to fetch staking round by network ${network}`, error)

    yield put(stakingRoundActions.fetchStakingRoundFailed())
  }
}

export function* watchStakingRound () {
  yield takeLatest(stakingRoundActions.fetchStakingRound.type, fetchStakingRoundWorker)
}
