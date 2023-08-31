import { takeLatest, select, call, put } from '@redux-saga/core/effects'
import { log } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj } from '@subsocial/utils'
import { getStakerRewards } from '../../../../api/creatorStaking'
import { FetchStakerRewardsProps, StakerRewardsEntity, selectStakerRewards, stakerRewardsActions } from './stakerRewardsSlice'
import BN from 'bignumber.js';

function* fetchStakerRewardsWorker (
  action: PayloadAction<FetchStakerRewardsProps>
) {
  const { account, spaceIds, reload = false } = action.payload

  try {
    const stakingRewardsFromStore: StakerRewardsEntity = yield select(selectStakerRewards, account)

    if(!stakingRewardsFromStore.rewards || isEmptyObj(stakingRewardsFromStore.rewards) || reload) {
      const result: Record<string, string> = yield call(getStakerRewards, account, spaceIds)
      
      if(!result || isEmptyObj(result)) {
        yield put(stakerRewardsActions.fetchStakerRewardsFailed({ account, spaceIds }))
        return
      }

      const rewardsSpaceIds = Object.keys(result || {})
      const totalRewards = Object.values(result || {}).reduce(
        (prevValue, currentValue) => new BN(prevValue).plus(currentValue).toString(),
        '0'
      )

      const rewards = {
        spaceIds: rewardsSpaceIds,
        totalRewards
      }
      
      yield put(stakerRewardsActions.fetchStakerRewardsSuccess({
        id: account,
        loading: false,
        rewards
      }))
    }
  } catch (error) {
    log.error('Failed to fetch staker rewards by account', account, error)
    yield put(stakerRewardsActions.fetchStakerRewardsFailed({ account, spaceIds }))
  }
}

export function* watchStakerRewards () {
  yield takeLatest(
    stakerRewardsActions.fetchStakerRewards.type,
    fetchStakerRewardsWorker
  )
}
