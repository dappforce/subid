import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { selectBackerLedger, backerLedgerActions } from './backerLedgerSlice'

export const fetchBackerLedger = (dispatch: any, account: string) => {
  dispatch(
    backerLedgerActions.fetchBackerLedger({
      account,
      reload: true,
    })
  )
}

export const useFetchBackerLedger = (account?: string) => {
  const dispatch = useAppDispatch()

  
  useEffect(() => {
    if(!account) return

    dispatch(
      backerLedgerActions.fetchBackerLedger({
        account,
        reload: false,
      })
    )
  }, [ account ])

  
}

export const useBackerLedger = (account?: string) => {
  return useAppSelector((state) => selectBackerLedger(state, account || ''))
}

