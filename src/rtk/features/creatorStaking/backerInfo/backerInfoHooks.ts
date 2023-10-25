import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { selectBackerInfo, selectBackerInfoBySpaces, backerInfoActions } from './backerInfoSlice'

export const fetchBackerInfo = (dispatch: any, ids: string[], account: string) => {
  dispatch(
    backerInfoActions.fetchBackerInfo({
      ids,
      account,
      reload: true,
    })
  )
}

export const useFetchBackerInfoBySpaces = (ids?: string[], account?: string) => {
  const dispatch = useAppDispatch()

  
  useEffect(() => {
    if(!ids || !account) return

    dispatch(
      backerInfoActions.fetchBackerInfo({
        ids,
        account,
        reload: false,
      })
    )
  }, [ ids?.join(), account ])

  
}

export const useBackerInfo = (id?: string, account?: string) => {
  return useAppSelector((state) => selectBackerInfo(state, id, account))
}

export const useBackerInfoBySpaces = (ids?: string[], account?: string) => {
  return useAppSelector((state) => selectBackerInfoBySpaces(state, ids, account))
}