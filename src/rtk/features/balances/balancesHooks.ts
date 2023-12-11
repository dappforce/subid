import { useAppSelector, AppDispatch, useAppDispatch } from '../../app/store'
import {
  selectBalances,
  selectManyBalances,
  balancesActions,
  BalancesEntity,
  BalanceEntityRecord,
} from './balancesSlice'
import {
  dispatchWithGenericAccounts,
  toGenericAccountId,
  toGenericAccountIds,
} from '../../app/util'
import { AccountInfoByChain } from 'src/components/identity/types'
import { useCurrentAccount } from 'src/components/providers/MyExtensionAccountsContext'
import { useEffect } from 'react'
import { supportedNetworks } from '../multiChainInfo/types'

export const fetchBalances = dispatchWithGenericAccounts(
  balancesActions.fetchBalances
)

export const fetchBalanceByNetwork = (
  dispatch: AppDispatch,
  accounts: string[],
  network?: string,
  reload?: boolean
) => {
  const genericAccounts = toGenericAccountIds(accounts)

  dispatch(
    balancesActions.fetchBalanceByNetwork({
      accounts: genericAccounts,
      network,
      reload: reload || true
    })
  )
}

type FetchBalanceByNetworkProps = {
  address?: string
  reload?: boolean
  network?: string
  trigger?: boolean
}

export const useFetchBalanceByNetwork = ({ address, reload, network, trigger = true }: FetchBalanceByNetworkProps) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!address || !network || !trigger) return

    const getBalanceByNetwork = () => {
      fetchBalanceByNetwork(dispatch, [ address ], network, reload)
    }

    getBalanceByNetwork()
  }, [ address, network, trigger ])
}

export const useFetchBalances = (addressesToFetch?: string[]) => {
  const currentAddresses = useCurrentAccount()
  const addresses = addressesToFetch ?? currentAddresses
  const dispatch = useAppDispatch()
  const selectedBalances = useManyBalances(addresses)

  const selectedBalancesValues = selectedBalances
    ? Object.values(selectedBalances).map((item) => item.balances)
    : []

  useEffect(() => {
    const reloading =
      selectedBalances &&
      Object.values(selectedBalances).every((item) => item.loading)

    if (!addresses || reloading) return

    const isReload =
      selectedBalances &&
      Object.values(selectedBalances).some(
        (balance) => balance?.balances && balance.balances.length <= supportedNetworks.length
      )

    const getBalances = () => {
      const genericAccounts = toGenericAccountIds(addresses)
      dispatch(
        balancesActions.fetchBalances({
          accounts: genericAccounts,
          reload: !!isReload,
        })
      )
    }

    getBalances()
  }, [ addresses?.join(','), selectedBalancesValues.length ])
}

export const useBalances = (address?: string): BalancesEntity | undefined =>
  useAppSelector<BalancesEntity | undefined>((state) =>
    selectBalances(state, toGenericAccountId(address))
  )

type UseBalancesByNetworkProps = {
  address?: string
  network?: string
  currency?: string
}

export const useBalancesByNetwork = ({
  address,
  network,
  currency,
}: UseBalancesByNetworkProps): {
  currencyBalance: AccountInfoByChain | undefined
  loading: boolean
} => {
  const { balances, loading } = useBalances(address) || {}
  const balancesByNetwork = balances?.find((x) => x?.network === network)

  if (!currency) return { currencyBalance: undefined, loading: false }

  return {
    currencyBalance: balancesByNetwork?.info[currency],
    loading: loading ?? false,
  }
}

export const useManyBalances = (accounts?: string[]) => {
  const genericAddresses = accounts?.map((account) =>
    toGenericAccountId(account)
  )

  return useAppSelector<BalanceEntityRecord | undefined>((state) =>
    selectManyBalances(state, genericAddresses)
  )
}
