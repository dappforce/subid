import { AppDispatch, useAppDispatch, useAppSelector } from '../../../app/store'
import {
  GeneralEraInfo,
  generalEraInfoActions,
  selectGeneralEraInfo,
} from './generalEraInfoSlice'

export const fetchGeneralEraInfo = (dispatch: AppDispatch) => {
  dispatch(generalEraInfoActions.fetchGeneralEraInfo())
}

export const useFetchGeneralEraInfo = () => {
  const dispatch = useAppDispatch()

  dispatch(generalEraInfoActions.fetchGeneralEraInfo())
}

export const useGeneralEraInfo = (): GeneralEraInfo | undefined => {
  return useAppSelector<GeneralEraInfo | undefined>((state) =>
    selectGeneralEraInfo(state)
  )
}
