import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { selectStakerLedger, stakerLedgerActions } from './stakerLedgerSlice'

export const fetchStakerLedger = (dispatch: any, account: string) => {
  dispatch(
    stakerLedgerActions.fetchStakerLedger({
      account,
      reload: true,
    })
  )
}

export const useFetchStakerLedger = (account?: string) => {
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

