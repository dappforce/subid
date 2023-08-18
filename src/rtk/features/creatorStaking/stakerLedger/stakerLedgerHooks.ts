import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { selectStakerLedger, stakerLedgerActions } from './stakerLedgerSlice'

export const useFetchStakerLedgerBySpaces = (account?: string) => {
  const dispatch = useAppDispatch()

  
  useEffect(() => {
    if(!account) return

    dispatch(
      stakerLedgerActions.fetchStakerLedger({
        account,
        reload: false,
      })
    )
  }, [ account ])

  
}

export const useStakerLedger = (account?: string) => {
  return useAppSelector((state) => selectStakerLedger(state, account || ''))
}

