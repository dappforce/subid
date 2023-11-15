import React, { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { nonEmptyArr } from '@subsocial/utils'
import { getAddressFromStorage, signOut, checkIsMulti, getCurrentWallet } from '../utils/index'
import SignInModal from '../onlySearch/SignInModal'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector, AppDispatch } from '../../rtk/app/store'
import { selectAccounts } from '../../rtk/features/accounts/accountsSlice'
import { toGenericAccountId, getAddressesByDomain, toGenericAccountIds } from '../../rtk/app/util'
import { selectCurrentAccount, currentAccountActions } from '../../rtk/features/accounts/currentAccountSlice'
import { recheckStatuses, mobileWalletConection, desktopWalletConnect } from './utils'
import { ExtensionAccountContext, Balances, Status } from './types'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { BIGNUMBER_ZERO } from '../../config/app/consts'

const defaultCrowdloanBalances = {
  kusama: BIGNUMBER_ZERO,
  polkadot: BIGNUMBER_ZERO
}

export const defaultBalances = {
  freeChainBalances: BIGNUMBER_ZERO,
  lockedChainBalances: BIGNUMBER_ZERO,
  lockedCrowdloanBalances: defaultCrowdloanBalances,
  assetLockedBalance: BIGNUMBER_ZERO,
}

export enum StepsEnum {
  Disabled = -1,
  SelectWallet,
  SelectAccount
}

export const ExtensionAccountsContext = createContext<ExtensionAccountContext>({} as ExtensionAccountContext)

export function ExtensionAccountProvider (props: React.PropsWithChildren<{}>) {
  const { isMobile } = useResponsiveSize()

  const currentWallet = getCurrentWallet()

  const [ currentStep, setCurrentStep ] = useState(currentWallet || isMobile ? StepsEnum.SelectAccount : StepsEnum.SelectWallet)

  const currentAddress = useCurrentAccount()
  const [ showSignInModal, setShowSignInModal ] = useState(false)
  const [ myAccount, setMyAccount ] = useState<string>()
  const [ isMulti, setIsMulti ] = useState(currentAddress ? checkIsMulti(currentAddress.join(',')) : false)
  const [ balances, setBalances ] = useState<Balances>(defaultBalances)
  const [ refreshBalances, setRefreshBalances ] = useState(false)
  const dispatch = useAppDispatch()

  const { query: { address: addressOrDomainFromUrl } } = useRouter()

  const openModal = () => setShowSignInModal(true)
  const closeModal = () => setShowSignInModal(false)

  const [ recheckId, recheck ] = useReducer(x => (x + 1) % 16384, 0)

  const [ status, setStatus ] = useState<Status>('LOADING')

  useEffect(() => {
    const props = { dispatch, setStatus }
    isMobile ? mobileWalletConection(props) : desktopWalletConnect(props)
  }, [ recheckId ])

  useEffect(() => {
    if (!recheckStatuses.includes(status)) return

    const intervalId = setInterval(recheck, 1000)
    return () => clearInterval(intervalId)
  }, [ status ])


  useEffect(() => {
    const setAddresses = async () => {
      const addressesFromUrl = await getAddressesByDomain(addressOrDomainFromUrl?.toString().split(','))
      const addressFromStorage = getAddressFromStorage()

      let address = addressesFromUrl?.join(',')

      if (!address && status === 'OK') {
        address = addressFromStorage
      }

      setIsMulti(checkIsMulti(address))

      setMyAccount(addressFromStorage)
      setCurrentAddress(dispatch, address || '')
    }

    setAddresses()

  }, [ addressOrDomainFromUrl, status ])

  const obj: ExtensionAccountContext = {
    extensionStatus: status,
    myAccount,
    balances,
    currentStep,
    isMulti,
    refreshBalances,
    setRefreshBalances,
    setBalances: (balances: Partial<Balances>) => setBalances(b => ({ ...b, ...balances })),
    setMyAddress: (address: string) => setMyAccount(address),
    setIsMulti: (isMulti: boolean) => setIsMulti(isMulti),

    signOut: () => {
      signOut()
      setMyAccount('')
    },

    openModal,
    closeModal,
    setCurrentStep
  }

  return (
    <ExtensionAccountsContext.Provider value={obj}>
      {props.children}
      <SignInModal open={showSignInModal} hide={closeModal} />
    </ExtensionAccountsContext.Provider>
  )
}

export const setCurrentAddress = (dispatch: AppDispatch, accounts: string) => {
  const genericAccounts = toGenericAccountIds(accounts.split(',')).join(',')

  dispatch({ type: currentAccountActions.setAccount.type, payload: genericAccounts })
}

export function useExtensionAccountsContext () {
  return useContext(ExtensionAccountsContext)
}

export function useMyExtensionAccount () {
  return useExtensionAccountsContext()
}

export function useIsMulti () {
  return useExtensionAccountsContext().isMulti
}

export const useIsMyAddress = (address?: string) => {
  const extensionAccounts = useMyExtensionAddresses()

  return extensionAccounts
    .map(x => x.address)
    .includes(toGenericAccountId(address))
}

export function useMyExtensionAddresses () {
  return useAppSelector<InjectedAccountWithMeta[]>(selectAccounts)
}

export function useCurrentAccount () {
  const addresses = useAppSelector<string>(selectCurrentAccount)?.split(',') || getAddressFromStorage()
  return addresses.filter(x => x)
}

export const useMyAddresses = (): string[] | undefined =>
  useMyExtensionAccount().myAccount?.split(',').filter(x => x)

export const useMyAddress = (): string | undefined => {
  const [ address ] = useMyAddresses() || []

  return address ? toGenericAccountId(address) : undefined
}

export const useIsMyConnectedAddress = (address: string) => {
  const myAccount = useMyExtensionAccount().myAccount
  return myAccount === toGenericAccountId(address)
}

export const useMyBalances = () => {
  return useMyExtensionAccount().balances
}

export function useIsSignedIn () {
  return nonEmptyArr(useMyAddresses()) || !!getAddressFromStorage()
}

export default ExtensionAccountProvider
