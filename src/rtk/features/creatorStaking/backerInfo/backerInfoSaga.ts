import { call, put, select, takeEvery } from '@redux-saga/core/effects'

import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj, isEmptyArray } from '@subsocial/utils'
import { getIdsThatNeedToFetch, log } from '../../../app/util'
import {
  BackerInfoEntity,
  BackerInfoProps,
  BackerInfoRecord,
  selectBackerInfoBySpaces,
  backerInfoActions,
} from './backerInfoSlice'
import { getBackerInfoBySpaces } from '../../../../api/creatorStaking'

export function* fetchBackerInfoWorker(action: PayloadAction<BackerInfoProps>) {
  const { ids, reload = false, account } = action.payload

  try {
    const backerInfoBySpaces: BackerInfoRecord = yield select(
      selectBackerInfoBySpaces,
      ids,
      account
    )

    const needFetch = getIdsThatNeedToFetch(backerInfoBySpaces, ids)

    const idsParam: string[] = reload ? ids : needFetch

    if (!isEmptyArray(idsParam)) {
      const info: Record<string, any> = yield call(
        getBackerInfoBySpaces,
        idsParam,
        account
      )

      if (!info || isEmptyObj(info)) {
        yield put(backerInfoActions.fetchBackerInfoFailed({ ids, account }))
        return
      }

      const backerInfoEntities: BackerInfoEntity[] = idsParam.map((id) => {
        const item = info[id]

        const entityId = `${id}-${account}`

        return {
          id: `${id}-${account}`,
          loading: false,
          info: {
            id: entityId,
            totalStaked: item?.[0]?.staked.toString() || '0',
            stakes: item,
          },
        }
      })

      yield put(backerInfoActions.fetchBackerInfoSuccess(backerInfoEntities))

      return
    }
  } catch (error) {
    log.error('Failed to fetch backer info', error)
  }
}

export function* watchBackerInfo() {
  yield takeEvery(backerInfoActions.fetchBackerInfo.type, fetchBackerInfoWorker)
}
