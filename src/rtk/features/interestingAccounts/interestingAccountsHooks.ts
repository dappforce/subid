import { Dispatch, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/store'
import {
  selectOverviewAccounts,
  overviewAccountsActions,
} from './interestingAccountsSlice'
import { AnyAction } from 'redux'
import { AccountCardType } from '../../../components/interesting-accounts/types'

export const fetchOverviewAccounts = (dispatch: Dispatch<AnyAction>) =>
  dispatch(overviewAccountsActions.fetchOverviewAccounts())

export const useFetchOverviewAccounts = () => {
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    fetchOverviewAccounts(dispatch)
  }, [])
}
export const useOverviewAccounts = () =>
  useAppSelector<AccountCardType[] | undefined>((state) =>
    selectOverviewAccounts(state)
  )
