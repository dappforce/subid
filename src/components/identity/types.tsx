import { AnyAccountId } from '@subsocial/api/types'
import { BareProps } from '../utils/Section'
import BN from 'bignumber.js'

export type IdentityBareProps = BareProps & {
  address: AnyAccountId
  details?: AccountIdentities
}

export type Info = {
  display: string
  legal: string
  web: string
  riot: string
  email: string
  twitter: string
}

export type InfoKeys = keyof Info

export const identityInfoKeys: InfoKeys[] = [
  'display',
  'legal',
  'web',
  'riot',
  'email',
  'twitter',
]

export type AccountInfoByChain = {
  accountId: string
  totalBalance: string
  reservedBalance: string
  frozenBalance: string
  freeBalance: string
  lockedBalance: string
}

export type AccountInfoItem = {
  network: string
  info: Record<string, AccountInfoByChain>
}

export type AccountInfo = AccountInfoItem[]

export type CrowdloansContributions = {
  network: string
  contribution: string
}

export type CrowdloansContributionsByParaId = Record<
  string,
  CrowdloansContributions
>

export type CrowdloanInfo = {
  depositor?: string
  verifier?: null
  deposit?: BN
  raised?: string
  end?: BN
  cap?: string
  firstPeriod?: number
  lastPeriod?: number
  trieIndex?: number
  isCapped?: boolean
  isEnded?: boolean
  isWinner?: boolean
  paraId: number
}

export type IdentityInfo = {
  [key: string]: string
}

export type Identity = {
  info: IdentityInfo
  isVerify: boolean
}

export type SubsocialProfile = {
  content: string
  createdByAccount: Record<'id', string>
  name: string
  id: string
  image: string
  about: string
  ownedByAccount: Record<'id', string>
  experimental: Record<string, string>
}

export type AccountIdentities = Record<string, SubsocialProfile | Identity>
