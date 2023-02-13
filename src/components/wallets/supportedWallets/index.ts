import { TalismanWallet } from './talisaman-wallet'
import { SubWallet } from './subwallet-wallet'
import { PolkadotjsWallet } from './polkadot-wallet'
import { Wallet } from '../types'

const supportedBothFormatWallets = [ 
  new TalismanWallet(),
  new SubWallet(),
]

const supportedPolkadotWallets = [
  new PolkadotjsWallet()
]

export const supportedWallets = {
  all: [ ...supportedPolkadotWallets, ...supportedBothFormatWallets ],
  evm: [ ... supportedBothFormatWallets ]
}

export type SupportedWalletsType = 'all' | 'evm'

export const getWalletBySource = (
  source: string | unknown
): Wallet | undefined => {
  return supportedWallets.all.find((wallet) => {
    return wallet.extensionName === source
  })
}

export const isWalletInstalled = (source: string | unknown): boolean => {
  const wallet = getWalletBySource(source)
  return wallet?.installed as boolean
}
