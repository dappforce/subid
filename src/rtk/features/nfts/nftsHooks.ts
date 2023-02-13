import { Dispatch, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/store'
import { nftsActions, selectNfts, NftsEntity, selectManyNfts } from './nftsSlice'
import { AnyAction } from 'redux'
import { convertToKusamaAddress } from 'src/components/utils'
import { useCurrentAccount } from 'src/components/providers/MyExtensionAccountsContext'

export const fetchNfts = (
  dispatch: Dispatch<AnyAction>,
  accounts: string[],
  reload?: boolean
) => {
  const kusamaAddress = accounts.map((account) =>
    convertToKusamaAddress(account)
  )

  dispatch(nftsActions.fetchNfts({ accounts: kusamaAddress, reload }))
}

export const useFetchNfts = () => {
  const dispatch = useAppDispatch()
  const addresses = useCurrentAccount()

  useEffect(() => {
    if (!addresses) return

    const getNfts = () => {
      const kusamaAddress = addresses.map((address) =>
      convertToKusamaAddress(address)
    )

      dispatch(nftsActions.fetchNfts({ accounts: kusamaAddress, reload: false }))
    }
    
    getNfts()

  }, [ addresses?.join(',') ])
}

export const useNfts = (address?: string) =>
  useAppSelector<NftsEntity | undefined>((state) =>
    selectNfts(state, convertToKusamaAddress(address))
  )

export const useManyNfts = (accounts?: string[]) => {
  const kusamaAddress = accounts?.map((account) =>
    convertToKusamaAddress(account)
  )

  return useAppSelector<Partial<NftsEntity> | undefined>((state) =>
    selectManyNfts(state, kusamaAddress)
  )
}
