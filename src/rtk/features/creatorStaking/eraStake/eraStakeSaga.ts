import { call, put, select, takeEvery } from '@redux-saga/core/effects'

import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj, isEmptyArray } from '@subsocial/utils'
import { getIdsThatNeedToFetch, log } from '../../../app/util'
import {
  EraStakeEntity,
  EraStakeFetchProps,
  EraStakesBySpaceIdsRecord,
  eraStakeActions,
  selectEraStakesBySpaceIds,
} from './eraStakeSlice'
import { getEraStakesBySpaceIds } from '../../../../api/creatorStaking'

export function* fetchEraStakeWorker (
  action: PayloadAction<EraStakeFetchProps>
) {
  const { ids, reload = false, era } = action.payload

  try {
    const eraStakesByIds: EraStakesBySpaceIdsRecord = yield select(
      selectEraStakesBySpaceIds,
      ids,
      era
    )

    const needFetch = getIdsThatNeedToFetch(eraStakesByIds, ids)

    const idsParam: string[] = reload ? ids : needFetch

    if (!isEmptyArray(idsParam)) {
      const info: Record<string, any> = yield call(getEraStakesBySpaceIds, idsParam, era)

      if (!info || isEmptyObj(info)) {
        yield put(eraStakeActions.fetchEraStakeFailed({ ids, era }))
        return
      }

      const eraStakesEntities: EraStakeEntity[] = idsParam.map(
        (id) => {
          const item = info[id]

          const commonParams = {
            id: `${id}-${era}`,
            loading: false,
          }

          if(!item) return {
            ...commonParams,
            info: {
              total: '0',
              numberOfStakers: '0',
              creatorRewardClaimed: false
            }
          }

          return {
            ...commonParams,
            info: item,
          }
        }
      )

      yield put(
        eraStakeActions.fetchEraStakeSuccess(eraStakesEntities)
      )
    }
  } catch (error) {
    log.error('Failed to fetch era stakes by space ids', error)
  }
}

export function* watchEraStake () {
  yield takeEvery(
    eraStakeActions.fetchEraStake.type,
    fetchEraStakeWorker
  )
}
