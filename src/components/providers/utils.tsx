import { isEmptyArray } from '@subsocial/utils'
import { accountsActions } from '../../rtk/features/accounts/accountsSlice'
import { ConnectWalletProps, Account } from './types'
import { getWalletBySource } from '../wallets/supportedWallets/index'
import { getCurrentWallet, setCurrentWallet } from '../utils/index'
import { AppDispatch } from '../../rtk/app/store'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { InjectedWindow } from '@polkadot/extension-inject/types'

export const recheckStatuses = [ 'UNAVAILABLE', 'UNAUTHORIZED' ]

export const DAPP_NAME = 'SubId'

export const mobileWalletConection = ({ dispatch, setStatus }: ConnectWalletProps) => {
  let unsub: Function | null = null
  let cancelled = false

    ; (async () => {
      const { isWeb3Injected, web3Enable, web3AccountsSubscribe } = await import('@polkadot/extension-dapp')
      const injectedExtensions = await web3Enable(DAPP_NAME)

      if (!isWeb3Injected) {
        if (!cancelled) setStatus('UNAVAILABLE')
        return
      }

      if (!injectedExtensions.length) {
        if (!cancelled) setStatus('UNAUTHORIZED')
        return
      }

      if (cancelled) return

      unsub = await web3AccountsSubscribe(async (accounts) => {
        if (!isEmptyArray(accounts)) {
          const addresses = accounts.map(account => account.address)

          setAccounts(dispatch, addresses, accounts)
        }

        setStatus(accounts.length < 1 ? 'NOACCOUNT' : 'OK')
      })

      if (cancelled) unsub()
    })()

  return () => {
    cancelled = true
    unsub && unsub()
  }
}

export const desktopWalletConnect = ({ dispatch, setStatus }: ConnectWalletProps) => {
  let unsub: any = null
  let cancelled = false

    ; (async () => {
      const currentWallet = getCurrentWallet() || 'polkadot-js'
      const wallet = getWalletBySource(currentWallet as string)

      if ((window as Window & InjectedWindow)?.injectedWeb3) {
        try {
          await wallet?.enable(DAPP_NAME)
          setCurrentWallet(currentWallet)
        } catch (err) {
          console.error(err)
        }
      }

      const extension = wallet?.extension

      if (!wallet?.installed) {
        if (!cancelled) setStatus('UNAVAILABLE')
        return
      }

      if (!extension) {
        if (!cancelled) setStatus('UNAUTHORIZED')
        return
      }

      if (cancelled) return

      unsub = await wallet.subscribeAccounts(async (accounts) => {
        if (cancelled) return

        if (accounts) {
          setAccountsAndFetchData(dispatch, accounts)
          setStatus(accounts.length < 1 ? 'NOACCOUNT' : 'OK')
        }
      })

      if (cancelled) unsub?.()
    })()

  return () => {
    cancelled = true
    unsub && unsub()
  }
}

const setAccounts = async (dispatch: AppDispatch, _addresses: string[], addressesWithMeta: Account[] | InjectedAccountWithMeta[]) => {
  dispatch({ type: accountsActions.setAccounts.type, payload: addressesWithMeta })
}

export const setAccountsAndFetchData = async (dispatch: AppDispatch, accounts: Account[]) => {
  if (!isEmptyArray(accounts)) {
    const addresses = accounts.map(account => account.address)
    const addressesWithMeta = accounts.map(account => {
      return {
        meta: { name: account.name },
        ...account
      }
    })


    await setAccounts(dispatch, addresses, addressesWithMeta)
  }
}