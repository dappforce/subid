import { RelayChain } from '../../types/index'
import BN from 'bignumber.js'
import { AppDispatch } from '../../rtk/app/store'

export type CrowdloanBalances = Record<RelayChain, BN>

export type Balances = {
  freeChainBalances: BN
  lockedChainBalances: BN
  lockedCrowdloanBalances: CrowdloanBalances
  assetLockedBalance: BN
}

export type ExtensionAccountContext = {
  extensionStatus: Status
  myAccount?: string
  isMulti: boolean
  balances: Balances
  currentStep: number
  refreshBalances: boolean
  setIsMulti: (isMulti: boolean) => void
  setBalances: (balance: Partial<Balances>) => void
  setRefreshBalances: (refresh: boolean) => void
  setMyAddress: (address: string) => void
  signOut: () => void
  openModal: () => void
  closeModal: () => void

  setCurrentStep: (step: number) => void
}

export type Status =
  | 'LOADING'
  | 'UNAVAILABLE'
  | 'UNAUTHORIZED'
  | 'NOACCOUNT'
  | 'OK'
  | 'DISCONNECTED'

export type Account = {
  // name contains the user-defined name of the account
  name?: string
  type?: string
  address: string
}

export type ConnectWalletProps = {
  dispatch: AppDispatch
  setStatus: (status: Status) => void
  signOut?: () => void
}
