import { RelayChain } from '../../../types/index'

export type StakingConsts = {
  minDelegatorStk: string
  minDelegaton: string
  maxDelegationsPerDelegator: number
}

export type ChainInfo = {
  /** Chain name. */
  id: string
  nativeToken: string
  totalIssuance: string
  ss58Format: number
  tokenDecimals: number[]
  tokenSymbols: string[]
  icon: string
  assetsRegistry: Record<string, any>
  name: string
  node: string
  wsNode?: string
  paraId: string
  existentialDeposit: string
  relayChain?: RelayChain
  connected?: boolean
  staking: StakingConsts
  vestingMethod?: string
  isEthLike?: boolean
  isTransferable?: boolean
  tokenTransferMethod?: string
}

export type AssetsType = {
  assetId: number
  name: string
  symbol: string
  icon: string
  deposit: string
  decimals: number
  isAssetFrozen: boolean
  owner: string
  issuer: string
  admin: string
  freezer: string
  supply: string
  minBalance: string
  isSufficient: boolean
  accounts: number
  sufficients: number
  approvals: number
}

export type MultiChainInfo = Record<string, ChainInfo>

export const supportedNetworks = [
  'polkadot',
  'kusama',
  'acala',
  'astar',
  'karura',
  'shiden',
  'khala',
  'phala',
  'bifrostPolkadot',
  'bifrostKusama',
  'statemine',
  'statemint',
  'kilt',
  'altair',
  'basilisk',
  'kintsugi',
  'bitCountry',
  'calamari',
  'subsocial',
  'litmus',
  'genshiro',
  'robonomics',
  'integritee',
  'pendulum',
  'centrifuge',
  'originTrail',
  'interlay',
  'picasso',
  'polkadex',
  'zeitgeist',
  'joystream',
  'hydradx',
  'turing',
  'edgeware',
  'parallel',
  'heiko',
  'chainx',
  'nodle',
  'darwinia',
  'darwinia-crab',
  'invArch',
  'invArch-polkadot',
  'unique',
  'quartz'
]

export const evmLikeNetworks = [ 'moonriver', 'moonbeam' ]
