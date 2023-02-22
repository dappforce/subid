import { call, put, takeLatest } from '@redux-saga/core/effects'
import { getValidatorStakingProps } from 'src/api'
import { PayloadAction } from '@reduxjs/toolkit'
import { log } from '../../../app/util'
import { stakingPropsActions, StakingProps } from './stakingPropsSlice'

export function* fetchStakingPropsWorker (action: PayloadAction<string>) {
  const network = action.payload

  try {
    const response: StakingProps = yield call(getValidatorStakingProps, network)

    yield put(stakingPropsActions.fetchStakingPropsSuccess({ id: network, props: response }))
  } catch (error) {
    log.error(`Failed to fetch validator staking props by network ${network}`, error)

    yield put(stakingPropsActions.fetchStakingPropsFailed())
  }
}

export function* watchStakingProps () {
  yield takeLatest(stakingPropsActions.fetchStakingProps.type, fetchStakingPropsWorker)
}
