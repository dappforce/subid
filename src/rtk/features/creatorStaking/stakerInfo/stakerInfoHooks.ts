import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { selectStakerInfo, selectStakerInfoBySpaces, stakerInfoActions } from './stakerInfoSlice'

export const fetchStakerInfo = (dispatch: any, ids: string[], account: string) => {
  dispatch(
    stakerInfoActions.fetchStakerInfo({
      ids,
      account,
      reload: true,
    })
  )
}

export const useFetchStakerInfoBySpaces = (ids?: string[], account?: string) => {
  const dispatch = useAppDispatch()

  
  useEffect(() => {
    if(!ids || !account) return

    dispatch(
      stakerInfoActions.fetchStakerInfo({
        ids,
        account,
        reload: false,
      })
    )
  }, [ ids?.join(), account ])

  
}

export const useStakerInfo = (id?: string, account?: string) => {
  return useAppSelector((state) => selectStakerInfo(state, id, account))
}

export const useStakerInfoBySpaces = (ids?: string[], account?: string) => {
  return useAppSelector((state) => selectStakerInfoBySpaces(state, ids, account))
}