import { call, put, takeLatest, select } from '@redux-saga/core/effects'
import { isEmptyArray } from '@subsocial/utils'
import { log } from '../../../app/util'
import { 
  CreatorsListEntity, 
  RegisteredCreator, 
  creatorsListActions, 
  selectCreatorsList 
} from './creatorsListSlice'
import { getCreatorsList } from '../../../../api/creatorStaking'


function* fetchCreatorsListWorker () {

  try {
    const candidates: CreatorsListEntity[] = yield select(selectCreatorsList)

    if (!isEmptyArray(candidates)) return

    const response: RegisteredCreator[] = yield call(getCreatorsList)

    if (isEmptyArray(response)) return

    const creatorsEntities = response.map((creator) => {
      return {
        id: creator.spaceId,
        creator
      }
    })

    yield put(
      creatorsListActions.fetchCreatorsListSuccess(creatorsEntities)
    )
  } catch (error) {
    log.error('Failed to fetch staking candidates list', error)
  }
}

export function* watchCreatorsList () {
  yield takeLatest(
    creatorsListActions.fetchCreatorsList.type,
    fetchCreatorsListWorker
  )
}
