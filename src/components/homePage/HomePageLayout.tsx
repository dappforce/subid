import BalancesTable from '../table/balancesTable/BalanceTable'
import NtfLayout from '../ntf/NftsLayout'
import { Overview } from '../overview/Overview'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { Tabs } from 'antd'
import { useState } from 'react'
import styles from './Index.module.sass'
import TxHistoryLayout from '../txHistory'

type OverviewSectionProps = {
  addresses: string[]
}

export const MAX_ITEMS_FOR_TABLE = 6

type HomePageTabKeys = 'portfolio' | 'history' | 'nfts'

const HomePageLayout = ({ addresses }: OverviewSectionProps) => {
  const chainsInfo = useChainInfo()
  const [activeTab, setActiveTab] = useState<HomePageTabKeys>('portfolio')

  const tabs = [
    {
      key: 'portfolio',
      tab: 'Portfolio',
      children: (
        <BalancesTable
          showTabs={true}
          showCheckBox={true}
          addresses={addresses!}
          chainsInfo={chainsInfo}
        />
      ),
    },
    {
      key: 'nfts',
      tab: 'NFTs',
      children: <NtfLayout addresses={addresses} />,
    },
    {
      key: 'history',
      tab: 'History',
      children: <TxHistoryLayout />,
    },
  ]

  return (
    <>
      <Overview />

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
