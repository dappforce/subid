import { useAppDispatch, useAppSelector } from '../../app/store'
import { toGenericAccountId, toGenericAccountIds } from '../../app/util'
import {
  contributionsActions,
  ContributionsEntity,
  selectContributions,
  ContributionsRecord,
  selectManyContributions
} from './contributionsSlice'
import { AnyAction } from 'redux'
import { Dispatch, useEffect } from 'react'
import { RelayChain } from '../../../types/index'
import { FETCH_DOTSAMA_CONTRIBUTIONS } from './contributionsSaga'
import { relayChains } from '../../../components/table/utils'
import { useCurrentAccount } from 'src/components/providers/MyExtensionAccountsContext'

export const fetchDotsamaContributions = (
  dispatch: Dispatch<AnyAction>,
  accounts: string[]
) => {
  const genericAccounts = toGenericAccountIds(accounts)

  dispatch({
    type: FETCH_DOTSAMA_CONTRIBUTIONS,
    payload: { relayChains, accounts: genericAccounts },
  })
}

export const fetchContributions = (
  dispatch: Dispatch<AnyAction>,
  accounts: string[],
  relayChain: RelayChain,
  reload?: boolean
) => {
  const genericAccounts = toGenericAccountIds(accounts)

  dispatch(
    contributionsActions.fetchContributions({
      accounts: genericAccounts,
      relayChain,
      reload,
    })
  )
}

export const useDotsamaContributions = () => {
  const dispatch = useAppDispatch()
  const addresses = useCurrentAccount()

  useEffect(() => {
    if (!addresses) return

    const getDotsamacontributions = () => {
      const genericAccounts = toGenericAccountIds(addresses)

      dispatch({
        type: FETCH_DOTSAMA_CONTRIBUTIONS,
        payload: { relayChains, accounts: genericAccounts },
      })
    }
    
    getDotsamacontributions()

  }, [ addresses?.join(',') ])
}

export const useContributions = (relayChian: RelayChain, address?: string) =>
  useAppSelector<ContributionsEntity | undefined>((state) =>
    selectContributions(state, toGenericAccountId(address), relayChian)
  )

export const useManyContributions = (relayChian: RelayChain, accounts?: string[]) => {
  const genericAddresses = accounts?.map((account) =>
    toGenericAccountId(account)
  )

  return useAppSelector<ContributionsRecord | undefined>((state) =>
    selectManyContributions(state, relayChian, genericAddresses)
  )
}
