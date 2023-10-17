import { takeLatest, select, call, put } from '@redux-saga/core/effects'
import { log } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj } from '@subsocial/utils'
import { getBackerRewards } from '../../../../api/creatorStaking'
import {
  FetchBackerRewardsProps,
  BackerRewardsEntity,
  selectBackerRewards,
  backerRewardsActions,
} from './backerRewardsSlice'
import BN from 'bignumber.js'

type Result = {
  availableClaimsBySpaceId: Record<string, string>
  rewardsBySpaceId: Record<string, string>
}

function* fetchBackerRewardsWorker (
  action: PayloadAction<FetchBackerRewardsProps>
) {
  const { account, spaceIds, reload = false } = action.payload

  try {
    const stakingRewardsFromStore: BackerRewardsEntity = yield select(
      selectBackerRewards,
      account
    )

    if (
      !stakingRewardsFromStore.data ||
      isEmptyObj(stakingRewardsFromStore.data) ||
      reload
    ) {
      const result: Result = yield call(getBackerRewards, account, spaceIds)

      if (!result || isEmptyObj(result)) {
        yield put(
          backerRewardsActions.fetchBackerRewardsFailed({ account, spaceIds })
        )
        return
      }

      const { availableClaimsBySpaceId, rewardsBySpaceId } = result

      const rewardsSpaceIds = Object.keys(rewardsBySpaceId || {})
      const totalRewards = Object.values(rewardsBySpaceId || {}).reduce(
        (prevValue, currentValue) =>
          new BN(prevValue).plus(currentValue).toString(),
        '0'
      )

      const rewards = {
        spaceIds: rewardsSpaceIds,
        totalRewards,
      }

      const data = {
        availableClaimsBySpaceId,
        rewards,
      }

      yield put(
        backerRewardsActions.fetchBackerRewardsSuccess({
          id: account,
          loading: false,
          data,
        })
      )
    }
  } catch (error) {
    log.error('Failed to fetch backer rewards by account', account, error)
    yield put(
      backerRewardsActions.fetchBackerRewardsFailed({ account, spaceIds })
    )
  }
}

export function* watchBackerRewards () {
  yield takeLatest(
    backerRewardsActions.fetchBackerRewards.type,
    fetchBackerRewardsWorker
  )
}
