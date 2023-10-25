import { call, put, takeLatest } from '@redux-saga/core/effects'
import { getStakingConsts } from '../../../../api/creatorStaking'
import { StakingConsts, stakingConstsActions, stakingConstsId } from './stakingConstsSlice'
import { log } from '../../../app/util'

export function* fetchStakingConstsWorker () {
  try {
    const response: StakingConsts | undefined = yield call(getStakingConsts)

    if(!response) {
      yield put(stakingConstsActions.fetchStakingConstsFailed())
      return
    }

    yield put(stakingConstsActions.fetchStakingConstsSuccess({ id: stakingConstsId, ...response }))
  } catch (error) {
    log.error('Failed to fetch staking constants', error)

    yield put(stakingConstsActions.fetchStakingConstsFailed())
  }
}

export function* watchCreatorStakingConsts () {
  yield takeLatest(stakingConstsActions.fetchStakingConsts.type, fetchStakingConstsWorker)
}
