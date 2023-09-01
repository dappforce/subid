import { ColumnsType } from 'antd/lib/table'
import { useEffect, useState } from 'react'
import {
  useIsMyConnectedAddress,
  useMyExtensionAccount,
} from '../../providers/MyExtensionAccountsContext'
import CustomTable from '../customTable'
import { BalanceTableProps, CrowdloansTableInfo, CrowdloansTab } from '../types'
import {
  CROWDLOAN_TABLE_VIEW,
  CROWDLOAN_SHOW_ZERO_BALANCES,
  fieldSkeleton,
  TableTabsTabs,
  isDataLoading,
} from '../utils'
import styles from '../Table.module.sass'
import { RelayChain } from '../../../types'
import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { startWithUpperCase } from '../../utils'
import { isEmptyArray } from '@subsocial/utils'
import { usePrices } from '../../../rtk/features/prices/pricesHooks'
import {
  fetchContributions,
  useManyContributions,
} from '../../../rtk/features/contributions/contributionsHooks'
import { useAppDispatch } from '../../../rtk/app/store'
import { useCrowdloanInfo } from '../../../rtk/features/crowdloanInfo/crowdloanInfoHooks'
import { parseCrowdloansTableInfo } from './parseContrbutionsInfo'
import { ChainInfo } from '../../../rtk/features/multiChainInfo/types'
import { useNetworkByParaId } from '../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useIdentitiesByAccounts } from '../../../rtk/features/identities/identitiesHooks'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { fetchVestingData } from 'src/rtk/features/vesting/vestingHooks'
import { BIGNUMBER_ZERO } from '../../../config/app/consts'
import { useSendEvent } from 'src/components/providers/AnalyticContext'

const getTabKeys = (t: TFunction) => [
  { key: 'All', label: t('table.balances.tabs.all') },
  { key: 'Active', label: t('table.balances.tabs.active') },
  { key: 'Winner', label: t('table.balances.tabs.winner') },
  { key: 'Ended', label: t('table.balances.tabs.ended') },
]

export const createFieldSkeletons = (data?: CrowdloansTableInfo[]) => {
  if (!data) return []

  return data.map((item) => {
    item.balanceWithoutChildren = fieldSkeleton
    item.balance = fieldSkeleton
    item.price = fieldSkeleton
    item.total = fieldSkeleton

    if (item.children && !isEmptyArray(item.children)) {
      item.children = item.children.map((child) => {
        child.balance = fieldSkeleton
        child.total = fieldSkeleton
        child.price = fieldSkeleton

        return child
      })
    }

    return item
  })
}

const filterDataByKey = (
  tabKey: CrowdloansTab,
  data?: CrowdloansTableInfo[]
) => {
  if (!data) return []

  if (tabKey !== 'All') {
    return data?.filter((x) => x.statusValue === tabKey)
  }

  return data
}

const getColumns = (
  chainInfo: ChainInfo,
  isMyAddress: boolean,
  isMulti: boolean,
  t: TFunction
): ColumnsType<any> => {
  if (!chainInfo) return []

  const { tokenSymbols } = chainInfo

  const symbol =
    tokenSymbols && !isEmptyArray(tokenSymbols) ? tokenSymbols[0] : ''
  const claimCrowdloanColumns = []
  if (isMyAddress && !isMulti) {
    claimCrowdloanColumns.push(
      ...[
        {
          title: (
            <h3 className='font-weight-bold FontSmall'>
              {t('table.labels.claimable')}
            </h3>
          ),
          dataIndex: 'claimable',
        },
        {
          dataIndex: 'claimRewards',
        },
      ]
    )
  }

  return [
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          {t('table.labels.chain')}
        </h3>
      ),
      dataIndex: 'chain',
      className: styles.CrowdloansChainColumn,
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          {t('table.labels.contribution')}
        </h3>
      ),
      dataIndex: 'balance',
      align: 'right',
      className: styles.ContributionColumn,
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          {t('table.labels.raised')}
        </h3>
      ),
      dataIndex: 'raised',
      align: 'right',
      className: styles.RaisedColumn,
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          <span className='d-flex align-items-center justify-content-end'>
            <div className={styles.SmallLineHeight}>
              {t('table.labels.cap')}
            </div>
            <Tooltip
              className='ml-2 FontSmall'
              title={<div>{t('tooltip.maximumContribution', { symbol })}</div>}
            >
              <InfoCircleOutlined />
            </Tooltip>
          </span>
        </h3>
      ),
      dataIndex: 'cap',
      align: 'right',
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          <>
            <div>{t('table.labels.reward')}</div>
            <span className='d-flex align-items-center justify-content-center'>
              <div className={styles.SmallLineHeight}>%</div>
              <Tooltip
                className='ml-2 FontSmall'
                title={<div>{t('tooltip.percentageOfTotalSupply')}</div>}
              >
                <InfoCircleOutlined />
              </Tooltip>
            </span>
          </>
        </h3>
      ),
      dataIndex: 'rewardPool',
      align: 'center',
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          <>
            <div>{t('table.labels.referral')}</div>
            <span className='d-flex align-items-center justify-content-center'>
              <div className={styles.SmallLineHeight}>
                {t('table.labels.bonus')}
              </div>
              <Tooltip
                className='ml-2 FontSmall'
                title={<div>{t('tooltip.additionalReward', { symbol })}</div>}
              >
                <InfoCircleOutlined />
              </Tooltip>
            </span>
          </>
        </h3>
      ),
      dataIndex: 'refBonus',
      align: 'center',
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall mr-3'>
          {t('table.labels.status')}
        </h3>
      ),
      dataIndex: 'status',
      align: 'center',
    },
    ...claimCrowdloanColumns,
    {
      dataIndex: 'links',
    },
  ]
}

type CrowdloanTableProps = BalanceTableProps & {
  relayChain: RelayChain
}

export const CrowdloansTable = (props: CrowdloanTableProps) => {
  const {
    setBalances,
    balances: { lockedCrowdloanBalances },
    isMulti,
  } = useMyExtensionAccount()
  const [ totalContribution, setTotalContribution ] = useState(BIGNUMBER_ZERO)

  const [ loading, setLoading ] = useState<boolean>(false)
  const [ data, setData ] = useState<CrowdloansTableInfo[]>()
  const [ tabKey, setTabKey ] = useState<string>('All')
  const tokenPrices = usePrices()
  const networkByParaId = useNetworkByParaId()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const {
    showTabs,
    maxItems,
    chainsInfo,
    addresses,
    relayChain,
    showZeroBalance,
    showCheckBox,
  } = props
  useEffect(() => {
    if (!data) return
    const displayedData = data.slice(0, maxItems)
    const networks = displayedData.map((data) => data.networkName)
    fetchVestingData(dispatch, addresses, networks)
  }, [ maxItems, data ])

  const isMyAddress = useIsMyConnectedAddress(addresses?.[0])
  const identities = useIdentitiesByAccounts(addresses)
  const sendEvent = useSendEvent()

  const crowdloansInfo = useCrowdloanInfo(relayChain)

  const contributionsEntity = useManyContributions(relayChain, addresses)

  const contributionsLoading = isDataLoading(contributionsEntity)

  const fetchContributionsFunc = () => {
    fetchContributions(dispatch, addresses, relayChain, true)
    const displayedData = data?.slice(0, maxItems)
    const networks = displayedData?.map((data) => data.networkName)
    if (networks && networks.length > 0) {
      fetchVestingData(dispatch, addresses, networks, true)
    }
  }

  useEffect(() => {
    setLoading(!contributionsEntity ? true : !!contributionsLoading)
  }, [ contributionsLoading ])

  useEffect(() => {
    setLoading(true)
  }, [ JSON.stringify(tokenPrices) ])

  useEffect(() => {
    if (!addresses || !chainsInfo || !crowdloansInfo) return

    let isMounted = true

    const loadInfo = async () => {
      const tableInfo = parseCrowdloansTableInfo({
        relayChain,
        chainsInfo,
        tokenPrices,
        crowdloansInfo,
        identities,
        balances: contributionsEntity,
        networkByParaId,
        isMulti,
        t,
        sendEvent,
      })

      if (tableInfo) {
        setData(tableInfo)

        if (contributionsLoading === false && contributionsEntity)
          setLoading(false)
      }

      let lockedBalances = BIGNUMBER_ZERO
      let totalContribution = BIGNUMBER_ZERO
      tableInfo?.forEach((info) => {
        if (info?.totalValue && !info.isReturned) {
          lockedBalances = lockedBalances.plus(info.totalValue)
        }
        totalContribution = totalContribution.plus(info.totalValue)
      })

      lockedCrowdloanBalances[relayChain] = lockedBalances

      setBalances({ lockedCrowdloanBalances })
      setTotalContribution(totalContribution)
    }

    isMounted &&
      loadInfo().catch((err) =>
        console.error('Failed to load crowdloans info:', err)
      )
  }, [ addresses?.join(','), isMulti, relayChain, loading ])

  const dataByKey: Partial<Record<CrowdloansTab, CrowdloansTableInfo[]>> = {}

  const tabs = getTabKeys(t)

  tabs.forEach(({ key }) => {
    const keyValue = key as CrowdloansTab
    dataByKey[keyValue] = filterDataByKey(keyValue, data)
  })

  return (
    <>
      <CustomTable
        actionsConfig={{
          title: t('table.crowdloan.title', {
            relayChain: startWithUpperCase(relayChain),
          }),
          showTabs,
          refreshText: t('table.crowdloan.refreshText'),
          checkBoxText: showCheckBox
            ? t('table.crowdloan.checkBoxText')
            : undefined,
        }}
        showAllPage={`${addresses?.join(',') || ''}/crowdloans/${relayChain}`}
        showTabs={showTabs}
        maxItems={maxItems}
        showZeroBalance={showZeroBalance}
        balanceKind='Crowdloan'
        columns={getColumns(chainsInfo[relayChain], isMyAddress, isMulti, t)}
        loading={loading}
        loadingLabel={t('table.crowdloan.loading', {
          relayChain: startWithUpperCase(relayChain),
        })}
        addresses={addresses}
        setLoading={setLoading}
        relayChain={relayChain}
        createFieldSkeletons={(data) =>
          createFieldSkeletons(data as CrowdloansTableInfo[])
        }
        data={dataByKey[tabKey as CrowdloansTab]}
        filterItem={(item) => item.statusValue === 'Active'}
        chainsInfo={chainsInfo}
        noData={t('table.crowdloan.noData')}
        storeTableView={CROWDLOAN_TABLE_VIEW}
        storeShowZeroBalance={CROWDLOAN_SHOW_ZERO_BALANCES}
        tabs={
          <TableTabsTabs
            data={dataByKey}
            tabs={tabs}
            tabKey={tabKey}
            setTabKey={setTabKey}
          />
        }
        onReload={fetchContributionsFunc}
        totalBalance={totalContribution}
      />
    </>
  )
}

export default CrowdloansTable
