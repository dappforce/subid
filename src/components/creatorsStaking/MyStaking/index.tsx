import { useState } from 'react'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'
import {
  useFetchBackerLedger,
  useBackerLedger,
} from '../../../rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import MyRewards from './MyRewards'
import Unstaking from '../UnstakingSection/Unstaking'
import { isEmptyArray, isEmptyObj } from '@subsocial/utils'
import WithdrawTxButton from '../UnstakingSection/WithdrawTxButton'
import { useBackerRewards } from '@/rtk/features/creatorStaking/backerRewards/backerRewardsHooks'

const MyStakingSection = () => {
  const myAddress = useMyAddress()
  const [ tab, setTab ] = useState(0)
  const backerLedger = useBackerLedger(myAddress)
  const rewards = useBackerRewards(myAddress)

  rewards?.data

  const { ledger } = backerLedger || {}

  const { locked, unbondingInfo } = ledger || {}
  const unbondingChunks = unbondingInfo?.unbondingChunks

  useFetchBackerLedger(myAddress)

  const hideSection =
    (!locked || locked === '0') &&
    !unbondingChunks?.length &&
    isEmptyObj(rewards?.data?.availableClaimsBySpaceId || {})

  if (hideSection) return null

  const tabs: TabsProps['tabs'] = [
    {
      id: 'my-rewards',
      text: 'My Rewards',
      content: () => <MyRewards />,
    },
    {
      id: 'unstaking',
      text: `Unstaking (${unbondingChunks?.length || 0})`,
      content: () => <Unstaking />,
      disabled: isEmptyArray(unbondingChunks),
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
          tabsRightElement={
            tab === 1 ? (
              <WithdrawTxButton switchToFirstTab={() => setTab(0)} />
            ) : null
          }
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
