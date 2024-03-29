import { call, put, select, takeEvery } from '@redux-saga/core/effects'

import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj, isEmptyArray } from '@subsocial/utils'
import { CreatorSpaceEntity, CreatorsSpacesRecord, SpacesFetchProps, creatorsSpacesActions, selectManySpaces } from './creatorsSpacesSlice'
import { getIdsThatNeedToFetch, log } from '../../../app/util'
import { getCreatorsSpaces } from 'src/api/creatorStaking'

export function* fetchCreatorsSpacesWorker (action: PayloadAction<SpacesFetchProps>) {
  const { ids, reload = false } = action.payload

  try {
    const creatorsSpaces: CreatorsSpacesRecord = yield select(
      selectManySpaces,
      ids
    )

    const needFetch = getIdsThatNeedToFetch(creatorsSpaces, ids)

    const idsParam: string[] = reload ? ids : needFetch

    if (!isEmptyArray(idsParam)) {
      const info: Record<string, any> = yield call(
        getCreatorsSpaces,
        idsParam
      )

      if (!info || isEmptyObj(info)) {
        yield put(
          creatorsSpacesActions.fetchCreatorsSpacesFailed({ ids })
        )
        return
      }

      const creatorSpacesEntities: CreatorSpaceEntity[] = Object.entries(info).map(([ _, item ]) => {
        return {
          id: item.id,
          loading: false,
          space: item,
        }
      })


      yield put(
        creatorsSpacesActions.fetchCreatorsSpacesSuccess(creatorSpacesEntities)
      )
    }
  } catch (error) {
    log.error('Failed to fetch creators spaces', error)

    yield put(
      creatorsSpacesActions.fetchCreatorsSpacesFailed({ ids })
    )
  }
}

export function* watchCreatorsSpaces () {
  yield takeEvery(creatorsSpacesActions.fetchCreatorsSpaces.type, fetchCreatorsSpacesWorker)
}
