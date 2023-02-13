import { Dispatch } from 'react'
import { useAppSelector } from '../../app/store'
import { selectOverviewAccounts, overviewAccountsActions } from './interestingAccountsSlice'
import { AnyAction } from 'redux'
import { AccountCardType } from '../../../components/interesting-accounts/types'

export const fetchOverviewAccounts = (dispatch: Dispatch<AnyAction>) =>
  dispatch(overviewAccountsActions.fetchOverviewAccounts())

export const useOverviewAccounts = () =>
  useAppSelector<AccountCardType[] | undefined>((state) =>
    selectOverviewAccounts(state)
  )

