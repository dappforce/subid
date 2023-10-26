import { call, put, takeLatest, select } from '@redux-saga/core/effects'
import { isDef, isEmptyArray } from '@subsocial/utils'
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
    const creatorsList: CreatorsListEntity[] = yield select(selectCreatorsList)

    
    if (!isEmptyArray(creatorsList)) return
    
    const response: RegisteredCreator[] = yield call(getCreatorsList)
    
    if (isEmptyArray(response)) return
    
    const creatorsEntities = response.map((creator) => {
      if(creator.status !== 'Active') return

      return {
        id: creator.spaceId,
        creator
      }
    }).filter(isDef)

    yield put(
      creatorsListActions.fetchCreatorsListSuccess(creatorsEntities)
    )
  } catch (error) {
    log.error('Failed to fetch staking creators list', error)
  }
}

export function* watchCreatorsList () {
  yield takeLatest(
    creatorsListActions.fetchCreatorsList.type,
    fetchCreatorsListWorker
  )
}
