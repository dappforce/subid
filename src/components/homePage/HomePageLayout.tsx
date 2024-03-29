import NtfLayout from '../ntf/NftsLayout'
import { Tabs } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import styles from './Index.module.sass'
import BalancesTable from '../table/balancesTable'
import { useSendEvent } from '../providers/AnalyticContext'
import { useRouter } from 'next/router'
import TxHistoryLayout from '../txHistory'
import { useIsMulti } from '../providers/MyExtensionAccountsContext'

type OverviewSectionProps = {
  addresses: string[]
}

export const MAX_ITEMS_FOR_TABLE = 6

type HomePageTabKeys = 'portfolio' | 'history' | 'nfts'

const HomePageLayout = ({ addresses }: OverviewSectionProps) => {
  const { query: queryParams, pathname, replace } = useRouter()
  const isMulti = useIsMulti()

  const [ activeTab, setActiveTab ] = useState<HomePageTabKeys>(
    (queryParams?.tab as HomePageTabKeys) || 'portfolio'
  )
  const sendEvent = useSendEvent()

  useEffect(() => {
    if (isMulti && activeTab === 'history') {
      setActiveTab('portfolio')
    }
  }, [ isMulti, activeTab ])

  const tabs = useMemo(() => {
    const txHistoryTab = isMulti
      ? {}
      : {
          key: 'history',
          tab: 'Subsocial History',
          children: <TxHistoryLayout addresses={addresses} />,
        }

    return [
      {
        key: 'portfolio',
        tab: 'Portfolio',
        children: <BalancesTable addresses={addresses} />,
      },
      {
        key: 'nfts',
        tab: 'NFTs',
        children: <NtfLayout addresses={addresses} />,
      },
      txHistoryTab,
    ]
  }, [ isMulti, addresses.join(',') ])

  const onTabChanged = (tab: string) => {
    setActiveTab(tab as HomePageTabKeys)
    sendEvent('home_tab_changed', { value: tab })

    const query = { ...queryParams, tab }

    replace({ pathname, query })
  }

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={onTabChanged}
        renderTabBar={(props, DefaultTabBar) => (
          <div className={styles.TabName}>
            <DefaultTabBar {...props} />
          </div>
        )}
      >
        {tabs.map((tab) => (
          <Tabs.TabPane key={tab.key} tab={tab.tab}>
            {tab.children}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </>
  )
}

export default HomePageLayout
