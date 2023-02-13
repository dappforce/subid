import { takeLatest, select, call, put } from '@redux-saga/core/effects'
import { log } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { FetchStakingRewardProps, StakingReward } from './types'
import { selectStakingReward, stakingRewardActions, StakingRewardEntity } from './rewardsSlice'
import { getStakingReward } from '../../../../components/utils/OffchainUtils'
import { isEmptyObj } from '@subsocial/utils'

function* fetchStakingRewardWorker (
  action: PayloadAction<FetchStakingRewardProps>
) {
  const { network, account, reload = false } = action.payload

  try {
    const stakingRewarsdFromStore: StakingRewardEntity = yield select(selectStakingReward, account, network)

    if(!stakingRewarsdFromStore.rewards || isEmptyObj(stakingRewarsdFromStore.rewards) || reload) {
      const result: StakingReward = yield call(getStakingReward, network, account)
      
      if(!result || isEmptyObj(result)) {
        yield put(stakingRewardActions.fetcStakingRewardFailed({ account, network }))
        return
      }
      
      yield put(stakingRewardActions.fetchStakingRewardSuccess({
        id: `${account}-${network}`,
        loading: false,
        rewards: result
      }))
    }
  } catch (error) {
    log.error('Failed to fetch staking reward by account', account, error)
    yield put(stakingRewardActions.fetcStakingRewardFailed({ account, network }))
  }
}

export function* watchStakingReward () {
  yield takeLatest(
    stakingRewardActions.fetchStakingReward.type,
    fetchStakingRewardWorker
  )
}
