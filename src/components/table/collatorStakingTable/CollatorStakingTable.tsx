import { ColumnsType } from 'antd/lib/table'
import { useEffect, useMemo, useState } from 'react'
import { CollatorStakingInfo } from '../types'
import { fieldSkeleton, InnerBalancesTable, isDataLoading, TableTabsTabs, TableLoading } from '../utils'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import parseStakingInfo from './parseStakingInfo'
import { useIdentitiesByAccounts } from '../../../rtk/features/identities/identitiesHooks'
import { useMyAddresses, useMyAddress } from '../../providers/MyExtensionAccountsContext'
import {
  useStakingCandidatesListByNetwork,
  useStakingCandidatesInfoByNetwork,
  useSelectedCandidatesByNetwork
} from '../../../rtk/features/stakingCandidates/stakingCandidatesHooks'
import { useChainInfo } from '../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useStakingDelegatorsStateByNetwork } from '../../../rtk/features/stakingDelegators/stakingDelegatorHooks'
import { Col, Row, Switch } from 'antd'
import {
  useFetchStakingDataByNetwork,
  filterStakingDataByTabKey,
  StakingTab,
  StakingTabKey,
  filterStakingData
} from './utils'
import styles from './StakingTable.module.sass'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import { MobileStakingCards, MyStakeCount } from './utils'
import clsx from 'clsx'
import { isEmptyArray, isEmptyObj } from '@subsocial/utils'
import { ChainInfo } from '../../../rtk/features/multiChainInfo/types'
import { MutedDiv } from '../../utils/MutedText'

export const createFieldSkeletons = (data?: CollatorStakingInfo[]) => {
  if (!data) return []

  return data.map((item) => {
    item.staked = fieldSkeleton
    item.total = fieldSkeleton
    item.stakers = fieldSkeleton

    return item
  })
}

const getTabKeys = (t: TFunction): StakingTab[] => [
  { key: 'active', label: t('staking.tabs.active') },
  { key: 'waiting', label: t('staking.tabs.waiting') },
]

const getColumns = (t: TFunction, tabKey: string, chainInfo: ChainInfo): ColumnsType<any> => {
  const { tokenSymbols, nativeToken } = chainInfo || {}

  const nativeSymbol = nativeToken || tokenSymbols[0]

  return [
    {
      title: <h3 className='font-weight-bold FontSmall'>{tabKey === 'active' ? 'Collator' : 'Candidate'}</h3>,
      dataIndex: 'name',
    },
    {
      title: <h3 className='font-weight-bold FontSmall'>
        <div>{t('staking.table.myStake')}</div>
        <MutedDiv className={styles.TokenSymbol}>({nativeSymbol})</MutedDiv>
      </h3>,
      dataIndex: 'staked',
      align: 'right'
    },
    {
      title: <h3 className='font-weight-bold FontSmall'>
        <div>{t('staking.table.myUnstake')}</div>
        <MutedDiv className={styles.TokenSymbol}>({nativeSymbol})</MutedDiv>
      </h3>,
      dataIndex: 'unstaked',
      align: 'right'
    },
    {
      title: <h3 className='font-weight-bold FontSmall'>
        <div>{t('staking.table.selfStake')}</div>
        <MutedDiv className={styles.TokenSymbol}>({nativeSymbol})</MutedDiv>
      </h3>,
      dataIndex: 'selfStake',
      align: 'right'
    },
    {
      title: <h3 className='font-weight-bold FontSmall'>
        <div>{t('staking.table.total')}</div>
        <MutedDiv className={styles.TokenSymbol}>({nativeSymbol})</MutedDiv>
      </h3>,
      dataIndex: 'total',
      align: 'right'
    },
    {
      title: <h3 className='font-weight-bold FontSmall'>{t('staking.table.stakers')}</h3>,
      dataIndex: 'stakers',
      align: 'right'
    },
    {
      dataIndex: 'actions',
      align: 'right'
    },
  ]
}

type CollatorStakingTableProps = {
  network: string
}

export const CollatorStakingTable = ({ network }: CollatorStakingTableProps) => {
  const [ loading, setLoading ] = useState<boolean>(false)
  const { isMobile } = useResponsiveSize()
  const addresses = useMyAddresses()
  const [ showMyStake, setShowMyStake ] = useState<boolean>(false)
  const [ tabKey, setTabKey ] = useState<StakingTabKey>('active')
  const chainsInfo = useChainInfo()
  const { t, i18n: { language } } = useTranslation()
  const [ firstLoad, setFirstLoad ] = useState(true)

  const address = useMyAddress()

  const stakingCandidates = useStakingCandidatesListByNetwork(network)
  const selectedCandidatesByNetwork = useSelectedCandidatesByNetwork(network)

  useFetchStakingDataByNetwork(network, stakingCandidates, addresses)

  const stakingInfoEntities = useStakingCandidatesInfoByNetwork(network, stakingCandidates)
  const stakingDelegatorStateEntities = useStakingDelegatorsStateByNetwork(network, addresses)

  const stakingInfoLoading = isDataLoading(stakingInfoEntities)
  const stakingDelegatorStateLoading = isDataLoading(stakingDelegatorStateEntities)

  const identities = useIdentitiesByAccounts(stakingCandidates)

  useEffect(() => {
    setLoading(!stakingInfoEntities || !stakingDelegatorStateEntities
      ? true
      : !!stakingInfoLoading || !!stakingDelegatorStateLoading)
  }, [ stakingInfoLoading, stakingDelegatorStateLoading, network, addresses?.join(',') ])


  const tabs = getTabKeys(t)

  const { parsedData, filteredDataByTabKey } = useMemo(() => {
    const parsedData = parseStakingInfo({
      stakingCandidates,
      network,
      address,
      chainsInfo,
      stakingInfoEntities,
      stakingDelegatorStateEntities,
      selectedCandidatesByNetwork,
      identities
    })

    const filteredDataByTabKey = filterStakingDataByTabKey(tabs, parsedData)

    return { parsedData, filteredDataByTabKey }
  }, [ addresses?.join(','), loading, network, language ])

  const onSwitchChange = (checked: boolean) => {
    setShowMyStake(checked)
  }

  const filteredData = filterStakingData({ data: filteredDataByTabKey, tabKey, showMyStake })

  useEffect(() => {
    if(isEmptyObj(stakingDelegatorStateEntities) || stakingDelegatorStateLoading === true) return

    if(firstLoad) {
      const myStake = filterStakingData({ data: filteredDataByTabKey, tabKey, showMyStake: true })
  
      setShowMyStake(myStake.length > 0)
      setFirstLoad(false)
    }
  }, [ firstLoad, filteredDataByTabKey ])

  return loading || isEmptyArray(parsedData)
    ? <TableLoading loadingLabel={t('staking.loadingLabel')} />
    : <div>
      <Row justify='space-between' className={clsx({ ['pl-3 pr-3']: isMobile }, 'align-items-center')}>
        <Col>
          <TableTabsTabs
            className={styles.StakingTableTabs}
            data={filteredDataByTabKey || {}}
            tabs={tabs}
            setTabKey={setTabKey}
            tabKey={tabKey}
          />
        </Col>
        <Col className='d-flex align-items-center'>
          <Switch checked={showMyStake} onChange={onSwitchChange} />
          <div className='ml-2'>{t('staking.table.myStake')} <MyStakeCount data={filteredData} /></div>
        </Col>
      </Row>

      {isMobile
        ? <MobileStakingCards data={filteredData} />
        : <InnerBalancesTable
          loading={loading}
          columns={getColumns(t, tabKey, chainsInfo[network])}
          tableData={filteredData}
          noData={t('staking.noData')}
        />}
    </div>

}

export default CollatorStakingTable
