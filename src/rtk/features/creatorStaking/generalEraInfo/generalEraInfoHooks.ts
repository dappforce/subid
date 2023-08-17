import { useAppDispatch, useAppSelector } from '../../../app/store'
import {
  GeneralEraInfo,
  generalEraInfoActions,
  selectGeneralEraInfo,
} from './generalEraInfoSlice'

export const useFetchGeneralEraInfo = () => {
  const dispatch = useAppDispatch()

  dispatch(generalEraInfoActions.fetchGeneralEraInfo())
}

export const useGeneralEraInfo = (): GeneralEraInfo | undefined => {
  return useAppSelector<GeneralEraInfo | undefined>((state) =>
    selectGeneralEraInfo(state)
  )
}
