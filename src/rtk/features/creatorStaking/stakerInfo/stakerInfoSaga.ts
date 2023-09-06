import { call, put, select, takeEvery } from '@redux-saga/core/effects'

import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj, isEmptyArray } from '@subsocial/utils'
import { getIdsThatNeedToFetch, log } from '../../../app/util'
import {
  StakerInfoEntity,
  StakerInfoProps,
  StakerInfoRecord,
  selectStakerInfoBySpaces,
  stakerInfoActions,
} from './stakerInfoSlice'
import { getStakerInfoBySpaces } from '../../../../api/creatorStaking'

export function* fetchStakerInfoWorker (action: PayloadAction<StakerInfoProps>) {
  const { ids, reload = false, account } = action.payload

  try {
    const stakerInfoBySpaces: StakerInfoRecord = yield select(
      selectStakerInfoBySpaces,
      ids,
      account
    )

    const needFetch = getIdsThatNeedToFetch(stakerInfoBySpaces, ids)

    const idsParam: string[] = reload ? ids : needFetch

    if (!isEmptyArray(idsParam)) {
      const info: Record<string, any> = yield call(
        getStakerInfoBySpaces,
        idsParam,
        account
      )

      if (!info || isEmptyObj(info)) {
        yield put(stakerInfoActions.fetchStakerInfoFailed({ ids, account }))
        return
      }

      const stakerInfoEntities: StakerInfoEntity[] = idsParam.map(
        (id) => {
          const item = info[id]

          const entityId = `${id}-${account}`

          return {
            id: `${id}-${account}`,
            loading: false,
            info: {
              id: entityId,
              totalStaked: item?.[0]?.staked.toString() || '0',
              stakes: item
            },
          }
        }
      )

      yield put(stakerInfoActions.fetchStakerInfoSuccess(stakerInfoEntities))
    }
  } catch (error) {
    log.error('Failed to fetch staker info', error)
  }
}

export function* watchStakerInfo () {
  yield takeEvery(stakerInfoActions.fetchStakerInfo.type, fetchStakerInfoWorker)
}
