import { useState } from 'react'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'
import {
  useFetchStakerLedger,
  useStakerLedger,
} from '../../../rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import MyRewards from './MyRewards'
import Unstaking from './Unstaking'
import { isEmptyArray } from '@subsocial/utils'
import WithdrawTxButton from './WithdrawTxButton'

const MyStakingSection = () => {
  const myAddress = useMyAddress()
  const [ tab, setTab ] = useState(0)
  const stakerLedger = useStakerLedger(myAddress)

  const { ledger } = stakerLedger || {}

  const unlockingChunks = ledger?.unbondingInfo.unlockingChunks 

  useFetchStakerLedger(myAddress)

  const tabs: TabsProps['tabs'] = [
    {
      id: 'my-rewards',
      text: 'My Rewards',
      content: () => <MyRewards />,
    },
    {
      id: 'unstaking',
      text: `Unstaking (${unlockingChunks?.length || 0})`,
      content: () => <Unstaking />,
      disabled: isEmptyArray(unlockingChunks),
    },
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='text-2xl UnboundedFont md:px-6 px-0'>My Staking</div>

      <div className='w-full flex flex-col gap-4 bg-white rounded-[20px] md:p-6 p-4'>
        <Tabs
          className='px-0 md:flex-row flex-col md:items-center !items-start'
          panelClassName='mt-0 px-0'
          tabs={tabs}
          withHashIntegration={false}
          hideBeforeHashLoaded
          tabsRightElement={tab === 1 ? <WithdrawTxButton switchToFirstTab={() => setTab(0)} /> : null}
          manualTabControl={{
            selectedTab: tab,
            setSelectedTab: (selectedTab) => setTab(selectedTab),
          }}
        />
      </div>
    </div>
  )
}

export default MyStakingSection
