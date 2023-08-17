import { call, put, select, takeEvery } from '@redux-saga/core/effects'

import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj, isEmptyArray } from '@subsocial/utils'
import { CreatorSpaceEntity, CreatorsSpacesRecord, SpacesFetchProps, creatorsSpacesActions, selectManySpaces } from './creatorsSpacesSlice'
import { getIdsThatNeedToFetch, log } from '../../../app/util'
import { getCreatorsSpaces } from 'src/api/creatorStaking'

export function* fetchCreatorsSpacesWorker (action: PayloadAction<SpacesFetchProps>) {
  const { ids, reload = false } = action.payload

  try {
    const identitesEntityByAccounts: CreatorsSpacesRecord = yield select(
      selectManySpaces,
      ids
    )

    const needFetch = getIdsThatNeedToFetch(identitesEntityByAccounts, ids)

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

      const candidatesInfo: CreatorSpaceEntity[] = Object.entries(info).map(([ _, item ]) => {
        return {
          id: item.id,
          loading: false,
          space: item,
        }
      })


      yield put(
        creatorsSpacesActions.fetchCreatorsSpacesSuccess(candidatesInfo)
      )
    }
  } catch (error) {
    log.error('Failed to fetch creators spaces', error)
  }
}

export function* watchCreatorsSpaces () {
  yield takeEvery(creatorsSpacesActions.fetchCreatorsSpaces.type, fetchCreatorsSpacesWorker)
}
