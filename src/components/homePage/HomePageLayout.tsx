import NtfLayout from '../ntf/NftsLayout'
import { Tabs } from 'antd'
import { useState } from 'react'
import styles from './Index.module.sass'
import BalancesTable from '../table/balancesTable/BalanceTable'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'

type OverviewSectionProps = {
  addresses: string[]
}

export const MAX_ITEMS_FOR_TABLE = 6

type HomePageTabKeys = 'portfolio' | 'history' | 'nfts'

const HomePageLayout = ({ addresses }: OverviewSectionProps) => {
  const [ activeTab, setActiveTab ] = useState<HomePageTabKeys>('portfolio')
  const chainsInfo = useChainInfo()

  const tabs = [
    {
      key: 'portfolio',
      tab: 'Portfolio',
      children: (
        <BalancesTable addresses={addresses} chainsInfo={chainsInfo} />
      ),
    },
    {
      key: 'nfts',
      tab: 'NFTs',
      children: <NtfLayout addresses={addresses} />,
    },
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
