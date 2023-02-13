import { useAppDispatch, useAppSelector } from '../../app/store'
import {
  selectAssetsBalances,
  assetsBalancesActions,
  AssetsBalancesEntity,
  AssetsBalancesRecord,
  selectManyAssetsBalances,
} from './assetsBalancesSlice'
import { dispatchWithGenericAccounts, toGenericAccountId, toGenericAccountIds } from '../../app/util'
import { useCurrentAccount } from 'src/components/providers/MyExtensionAccountsContext'
import { useEffect } from 'react'

export const fetchAssetsBalances = dispatchWithGenericAccounts(
  assetsBalancesActions.fetchAssetsBalances
)

export const useFetchAssetsBalances = () => {
  const dispatch = useAppDispatch()

  const addresses = useCurrentAccount()

  useEffect(() => {
    if (!addresses) return

    const getAssetsBalances = () => {
      const genericAccounts = toGenericAccountIds(addresses)

      dispatch({
        type: assetsBalancesActions.fetchAssetsBalances.type,
        payload: { accounts: genericAccounts, reload: false },
      })
    }
    
    getAssetsBalances()

  }, [ addresses?.join(',') ])
}

export const useAssetsBalances = (address?: string) =>
  useAppSelector<AssetsBalancesEntity | undefined>((state) =>
    selectAssetsBalances(state, toGenericAccountId(address))
  )

export const useManyAssetsBalances = (accounts?: string[]) => {
  const genericAddresses = accounts?.map((account) =>
    toGenericAccountId(account)
  )

  return useAppSelector<AssetsBalancesRecord | undefined>((state) =>
    selectManyAssetsBalances(state, genericAddresses)
  )
}

