import { isDef, isEmptyArray } from '@subsocial/utils'
import styles from './BalancesBarChart.module.sass'
import { Tabs } from 'antd'
import { useMemo, useState } from 'react'
import { BarChartOutlined, PieChartOutlined } from '@ant-design/icons'
import { sortBy } from 'lodash'
import store from 'store'
import dynamic from 'next/dynamic'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { BarConfig, PieConfig } from '@ant-design/charts'
import { BalanceKind, TableInfo } from '../types'
import { RelayChain } from 'src/types'
import { useIsMulti } from 'src/components/providers/MyExtensionAccountsContext'
import { Loading } from 'src/components/utils'
import NoData from 'src/components/utils/EmptyList'

const Pie = dynamic(() => import('./charts/Pie'), { ssr: false })
const Bar = dynamic(() => import('./charts/Bar'), { ssr: false })

const { TabPane } = Tabs

const STORAGE_CHART_TAB = 'ChartTab'

function balanceKindToHAxisTitle (balanceKind: BalanceKind, t: TFunction, relayChain?: RelayChain): string {
  switch (balanceKind) {
    case 'NativeToken': return t('charts.nativeTokenHAxis')
    case 'Crowdloan': return t('charts.crowdloanHAxis', { symbol: relayChain === 'kusama' ? 'KSM' : 'DOT' })
    case 'StatemineAsset': return t('charts.nativeTokenHAxis')
    default: return t('charts.defaultAssetHAxis')
  }
}

function balanceKindToVAxisTitle (balanceKind: BalanceKind, t: TFunction): string {
  switch (balanceKind) {
    case 'NativeToken': return t('charts.nativeTokenVAxis')
    case 'Crowdloan': return t('charts.crowdloanVAxis')
    case 'StatemineAsset': return t('charts.statemineAssetVAxis')
    default: return t('charts.defaultVAxis')
  }
}

const getChartData = <T extends TableInfo>(tableData: T[], balanceKind: BalanceKind, type: ChartTabKey, t: TFunction, isMulti?: boolean) => {
  let data: any[] = []

  tableData.map((x) => {
    const totalValue = x?.totalValue?.toNumber()

    if (isMulti) {
      if (!totalValue) return

      data.push({
        chain: `${x.name}`,
        value: totalValue,
        type: t('charts.labels.multiLabel'),
        format: toShortMoney({ num: totalValue, prefix: '$' }),
        totalValue: totalValue
      })
    } else {
      if (balanceKind === 'NativeToken' && type !== 'pie') {
        const value = x?.children

        const [ free, reserved ] = value || []
        const freeBalanceBN = free?.totalValue
        const lockedBalanceBN = reserved?.totalValue

        if (!freeBalanceBN || !lockedBalanceBN || !totalValue) return undefined

        const freeBalance = freeBalanceBN.toNumber()
        const lockedBalance = lockedBalanceBN.toNumber()

        const result = [ {
          chain: `${x.name}`,
          value: freeBalance,
          type: t('charts.labels.transferable'),
          format: toShortMoney({ num: freeBalance, prefix: '$' }),
          totalValue: totalValue
        }, {
          chain: `${x.name}`,
          value: lockedBalance,
          type: t('charts.labels.reserved'),
          format: toShortMoney({ num: lockedBalance, prefix: '$' }),
          totalValue: totalValue
        } ]

        data.push(...result)
      } else {
        if (!totalValue) return undefined

        data.push({
          chain: `${x.name}`,
          value: totalValue,
          type: balanceKind === 'Crowdloan' ? t('charts.labels.locked') : t('charts.labels.multiLabel'),
          format: toShortMoney({ num: totalValue, prefix: '$' }),
        })
      }
    }
  }).filter(x => isDef(x))


  data = sortBy(data, x => x.totalValue ? -x.totalValue : -x.value)

  return data
}

type BalancesChartProps = {
  data: any[]
  balanceKind?: BalanceKind
  xAxisTitle?: string
  yAxisTitle?: string
}

const BalancesBarChart = ({ data, xAxisTitle, yAxisTitle, balanceKind }: BalancesChartProps) => {
  const bars = data.length / (balanceKind === 'NativeToken' ? 2 : 1)

  const label = useMemo<BarConfig['label']>(() => ({
    formatter: (data: any) => data.format,
    position: 'right',
    offset: 2,
    layout: [
      { type: 'interval-hide-overlap' },
    ],
  }), [])
  const tooltip = useMemo<BarConfig['tooltip']>(() => ({
    customItems: (data) =>
      data.map(b => ({ ...b, value: `$${new Intl.NumberFormat().format(b.data.value)}` }))
  }), [])
  return (
    <Bar
      autoFit={false}
      appendPadding={20}
      style={{ height: `${30 * bars * (1 + 0.02 * bars) + 120}px`, marginTop: 0 }}
      data={data}
      xField='value'
      yField='chain'
      tooltip={tooltip}
      xAxis={{ title: { text: xAxisTitle } }}
      yAxis={{ title: { text: yAxisTitle } }}
      seriesField='type'
      isStack={true}
      color={[ '#fa5e5a', '#81c784' ]}
      label={label}
    />
  )
}

const BalancesPieChart = ({ data }: BalancesChartProps) => {
  const label = useMemo<PieConfig['label']>(() => ({
    formatter: (data) => data.format,
    type: 'outer',
    content: ({ chain, format }) => `${chain} ≈ ${format}`,
  }), [])
  const tooltip = useMemo<PieConfig['tooltip']>(() => ({
    customItems: (data) =>
      data.map(b => ({ ...b, value: `$${new Intl.NumberFormat().format(b.data.value)}` }))
  }), [])

  return (
    <Pie
      data={data}
      angleField='value'
      colorField='chain'
      radius={0.8}
      label={label}
      tooltip={tooltip}
      interactions={[ { type: 'element-single-selected' }, { type: 'element-active' } ]}
    />
  )
}

type ShortMoneyProps = {
  num: number
  prefix?: string
  noFractionForZero?: boolean
}

function moneyToString ({ num, prefix, noFractionForZero }: ShortMoneyProps) {
  let fractions = 1
  if (num === 0 && noFractionForZero) {
    fractions = 0
  } else if (num < 1) {
    fractions = 2
  }
  return `${prefix ? prefix : ''}${num.toFixed(fractions)}`
}

const num1K = 1000
const num1M = num1K ** 2
const num1B = num1K ** 3
const num1T = num1K ** 4

export function toShortMoney ({ num, prefix, noFractionForZero }: ShortMoneyProps): string {
  if (num >= num1K && num < num1M) {
    return moneyToString({ num: num / num1K, prefix, noFractionForZero }) + 'K'
  } else if (num >= num1M && num < num1B) {
    return moneyToString({ num: num / num1M, prefix, noFractionForZero }) + 'M'
  } else if (num >= num1B && num < num1T) {
    return moneyToString({ num: num / num1B, prefix, noFractionForZero }) + 'B'
  }
  return moneyToString({ num, prefix, noFractionForZero })
}

type ChartTabKey = 'bar' | 'pie'

export type BalancesBarChartProps<T> = {
  loading?: boolean
  balanceKind: BalanceKind
  tableData: T[]
  noData: string
  relayChain?: RelayChain
}

const InnerBalancesChart = <T extends TableInfo>({ loading, balanceKind, tableData, noData, relayChain }: BalancesBarChartProps<T>) => {
  const { t } = useTranslation()
  const tabFromStorage = store.get(`${balanceKind}_${STORAGE_CHART_TAB}`)

  const isMulti = useIsMulti()
  const [ tabKey, setTabKey ] = useState<ChartTabKey>(tabFromStorage || 'bar')

  const data = useMemo<any[]>(() => {
    return getChartData(tableData, balanceKind, tabKey, t, isMulti)
  }, [ tableData, balanceKind, tabKey, t, isMulti ])

  if (loading) return <Loading />

  const xAxisTitle = balanceKindToHAxisTitle(balanceKind, t, relayChain)
  const yAxisTitle = balanceKindToVAxisTitle(balanceKind, t)

  const onTabChange = (key: string) => {
    setTabKey(key as ChartTabKey)
    store.set(`${balanceKind}_${STORAGE_CHART_TAB}`, key)
  }

  if (isEmptyArray(data)) return <NoData description={noData} />

  return (
    <>
      <Tabs activeKey={tabKey} onChange={onTabChange} className={`mb-0 ${styles.ChartTabs}`}>
        <TabPane tab={<><BarChartOutlined className={styles.BarChartIcon} />{t('charts.tabs.barChart')}</>} key='bar'>
          <BalancesBarChart data={data} balanceKind={balanceKind} xAxisTitle={xAxisTitle} yAxisTitle={yAxisTitle} />
        </TabPane>
        <TabPane tab={<><PieChartOutlined />{t('charts.tabs.pieChart')}</>} key='pie'>
          <BalancesPieChart data={data} />
        </TabPane>
      </Tabs>
    </>
  )
}

export const BalancesChart = <T extends TableInfo>(props: BalancesBarChartProps<T>) => (
  <div className={styles.BalancesBarChart}>
    <InnerBalancesChart {...props} />
  </div>
)