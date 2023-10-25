import { takeLatest, select, call, put, all } from '@redux-saga/core/effects'
import { log } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyArray, isEmptyObj } from '@subsocial/utils'
import { getCreatorRewards } from '../../../../api/creatorStaking'
import BN from 'bignumber.js'
import {
  CreatorRewardsEntity,
  FetchCreatorRewardsProps,
  creatorRewardsActions,
  selectCreatorRewards,
} from './creatorRewardsSlice'

type Result = {
  rewards: string
  availableClaims: string[]
}

function* fetchCreatorRewardsWorker (
  action: PayloadAction<FetchCreatorRewardsProps>
) {
  const { spaceIds, account, reload = false } = action.payload

  try {
    const creatorRewards: CreatorRewardsEntity = yield select(
      selectCreatorRewards,
      account
    )

    if (!creatorRewards.data || isEmptyObj(creatorRewards.data) || reload) {
      const fetchDataMap = spaceIds.map(function* (spaceId) {
        const rewards: Result = yield call(getCreatorRewards, spaceId)

        return rewards
      })

      const result: Result[] = yield all(fetchDataMap)

      if (!result || isEmptyArray(result)) {
        yield put(
          creatorRewardsActions.fetchCreatorRewardsFailed({ account, spaceIds })
        )
        return
      }

      const availableClaims: Record<string, string[]> = {}

      spaceIds.forEach((spaceId, i) => {
        const { availableClaims: availableClaimsForSpace } = result[i] || {}
        if(availableClaimsForSpace && !isEmptyArray(availableClaimsForSpace)) {
          availableClaims[spaceId] = availableClaimsForSpace
        }
      })

      const data = {
        rewards: result.reduce(
          (acc, cur) => new BN(acc).plus(new BN(cur.rewards)).toString(),
          '0'
        ),
        availableClaims: availableClaims,
      }

      yield put(
        creatorRewardsActions.fetchCreatorRewardsSuccess({
          id: account,
          loading: false,
          data,
        })
      )

      return
    }
  } catch (error) {
    log.error('Failed to fetch creator rewards by space ids', error)
    yield put(
      creatorRewardsActions.fetchCreatorRewardsFailed({ spaceIds, account })
    )
  }
}

export function* watchCreatorRewards () {
  yield takeLatest(
    creatorRewardsActions.fetchCreatorRewards.type,
    fetchCreatorRewardsWorker
  )
}
