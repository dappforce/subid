import BN from 'bignumber.js'
import { CrowdloanStatus } from '../../types'
import { MultiChainInfo } from '../../rtk/features/multiChainInfo/types'
import React from 'react'

export type BalanceKind = 'NativeToken' | 'Crowdloan' | 'StatemineAsset'

export type TableView = 'table' | 'cards' | 'pie'

export type AssetsTab = 'All' | 'Free' | 'Frozen'

export type CrowdloansTab = CrowdloanStatus | 'All'

export type TableViewOption = {
  label: React.ReactNode
  value: TableView
}

export type BalanceTableProps = {
  chainsInfo: MultiChainInfo
  addresses: string[]
  maxItems?: number
  showTabs?: boolean
  showZeroBalance?: boolean
  showCheckBox?: boolean
}

export type AllTableProps =
  BalancesTableInfo &
  CrowdloansTableInfo &
  AssetsTableInfo &
  CollatorStakingInfo

export type TableInfo = CommonTableInfo & Partial<AllTableProps>

export type CardAdditionalData = { icon?: React.ReactNode; label: string | React.ReactNode; value: React.ReactNode }
export type CardChildren = { data?: CardAdditionalData[]; custom?: React.ReactNode }
export type CommonTableInfo = {
  name: React.ReactNode | string
  icon: string

  key: string
  chain: React.ReactNode

  balance: React.ReactNode
  balanceValue: BN

  price: React.ReactNode

  total: React.ReactNode
  totalValue: BN
  totalTokensValue?: BN

  links: React.ReactNode

  cardChildren?: CardChildren
}

export type BalancesTableInfo = CommonTableInfo & {
  address: string

  balanceWithoutChildren: React.ReactNode
  balanceView: React.ReactNode
  children?: Partial<BalancesTableInfo>[]

  transferAction?: React.ReactNode
}

export type CrowdloansTableInfo = CommonTableInfo & {
  networkName: string
  raised: React.ReactNode
  refBonus: React.ReactNode
  status: React.ReactNode
  statusValue: CrowdloanStatus
  raisedValue: BN
  cap: React.ReactNode
  rewardPool: React.ReactNode
  balanceWithoutChildren: React.ReactNode
  balanceView: React.ReactNode
  children?: Partial<CrowdloansTableInfo>[]
  claimRewards: React.ReactNode
  claimable: React.ReactNode
  leaseEnd?: string
  isReturned?: boolean
}

export type AssetsTableInfo = CommonTableInfo & {
  address: string
  isFrozen?: boolean
  frozen?: React.ReactNode
  balanceWithoutChildren: React.ReactNode
  balanceView: React.ReactNode
  children?: Partial<AssetsTableInfo>[]
}

export type CollatorStakingInfo = CommonTableInfo & {
  stakers: React.ReactNode
  actions: React.ReactNode
  staked: React.ReactNode
  unstaked: React.ReactNode
  selfStake: React.ReactNode
  stakedValue: BN
  candidateStatus: string
}
