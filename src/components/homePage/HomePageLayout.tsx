import NtfLayout from '../ntf/NftsLayout'
import { Tabs } from 'antd'
import { useState } from 'react'
import styles from './Index.module.sass'
import BalancesTableNew from '../table/balancesTable'
import TxHistoryLayout from '../txHistory'

type OverviewSectionProps = {
  addresses: string[]
}

export const MAX_ITEMS_FOR_TABLE = 6

type HomePageTabKeys = 'portfolio' | 'history' | 'nfts'

const HomePageLayout = ({ addresses }: OverviewSectionProps) => {
  const [ activeTab, setActiveTab ] = useState<HomePageTabKeys>('portfolio')

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

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={(tab) => setActiveTab(tab as HomePageTabKeys)}
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
