import { AppDispatch, useAppSelector } from '../../../app/store'
import {
  CreatorsListEntity,
  creatorsListActions,
  selectCreatorsList,
} from './creatorsListSlice'

export const fetchCreatorsList = (dispatch: AppDispatch) => {
  dispatch(creatorsListActions.fetchCreatorsList())
}

export const useCreatorsList = () => {
  return useAppSelector<CreatorsListEntity[] | undefined>((state) =>
    selectCreatorsList(state)
  )
}
