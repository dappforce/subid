import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { selectStakerInfo, stakerInfoActions } from './stakerInfoSlice'

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
