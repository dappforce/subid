import { AppDispatch, useAppDispatch, useAppSelector } from '../../../app/store'
import {
  GeneralErainfoEntity,
  generalEraInfoActions,
  selectGeneralEraInfo,
} from './generalEraInfoSlice'

export const fetchGeneralEraInfo = (dispatch: AppDispatch) => {
  dispatch(generalEraInfoActions.fetchGeneralEraInfo({ reload: true }))
}

export const useFetchGeneralEraInfo = () => {
  const dispatch = useAppDispatch()

  dispatch(generalEraInfoActions.fetchGeneralEraInfo({ reload: false }))
}

export const useGeneralEraInfo = (): GeneralErainfoEntity | undefined => {
  return useAppSelector<GeneralErainfoEntity | undefined>((state) =>
    selectGeneralEraInfo(state)
  )
}
