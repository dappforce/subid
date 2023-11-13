import NtfLayout from '../ntf/NftsLayout'
import { Tabs } from 'antd'
import { useState } from 'react'
import styles from './Index.module.sass'
import BalancesTableNew from '../table/balancesTable'
import { useSendEvent } from '../providers/AnalyticContext'
import { useRouter } from 'next/router'
import TxHistoryLayout from '../txHistory'

type OverviewSectionProps = {
  addresses: string[]
}

export const MAX_ITEMS_FOR_TABLE = 6

type HomePageTabKeys = 'portfolio' | 'history' | 'nfts'

const HomePageLayout = ({ addresses }: OverviewSectionProps) => {
  const { query: queryParams, pathname, replace } = useRouter()

  const [ activeTab, setActiveTab ] = useState<HomePageTabKeys>(
    (queryParams?.tab as HomePageTabKeys) || 'portfolio'
  )
  const sendEvent = useSendEvent()

  const tabs = [
    {
      key: 'portfolio',
      tab: 'Portfolio',
      children: <BalancesTableNew addresses={addresses} />,
    },
    {
      key: 'nfts',
      tab: 'NFTs',
      children: <NtfLayout addresses={addresses} />,
    },
    {
      key: 'history',
      tab: 'History',
      children: <TxHistoryLayout addresses={addresses} />,
    }
  ]

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
