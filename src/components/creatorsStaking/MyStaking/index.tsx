import { useMemo, useState } from 'react'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'
import {
  fetchStakerLedger,
  useFetchStakerLedger,
  useStakerLedger,
} from '../../../rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import MyRewards from './MyRewards'
import Unstaking from './Unstaking'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import Button from '../tailwind-components/Button'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import BN from 'bignumber.js'
import { isEmptyArray } from '@subsocial/utils'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchBalanceByNetwork } from 'src/rtk/features/balances/balancesHooks'

const WithdrawTxButton = () => {
  const myAddress = useMyAddress()
  const stakerLedger = useStakerLedger(myAddress)
  const eraInfo = useGeneralEraInfo()
  const dispatch = useAppDispatch()

  const { ledger } = stakerLedger || {}
  const { currentEra } = eraInfo || {}

  const unlockingChunks = ledger?.unbondingInfo.unlockingChunks

  const disableButton = useMemo(() => {
    if(!currentEra || !unlockingChunks || isEmptyArray(unlockingChunks)) return true

    return unlockingChunks?.some((item) => {
      const { unlockEra } = item

      return new BN(currentEra).lt(new BN(unlockEra))
    })
  }, [!!unlockingChunks, currentEra])

  const onSuccess = () => {
    fetchStakerLedger(dispatch, myAddress || '')
    fetchBalanceByNetwork(dispatch, [myAddress || ''], 'subsocial')
  }

  const onFailed = () => {
    console.log('Failed')
  }

  const Component: React.FunctionComponent<{ onClick?: () => void }> = (
    compProps
  ) => (
    <Button {...compProps} variant={'primary'} size={'sm'}>
      Withdraw available
    </Button>
  )

  return (
    <LazyTxButton
      network='subsocial'
      accountId={myAddress}
      tx={'creatorStaking.withdrawUnstaked'}
      disabled={disableButton}
      component={Component}
      onFailed={onFailed}
      onSuccess={onSuccess}
    />
  )
}

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
      <div className='text-2xl UnboundedFont px-6'>My Staking</div>

      <div className='w-full flex flex-col gap-4 bg-white rounded-[20px] p-6'>
        <Tabs
          className='px-0'
          panelClassName='mt-0 px-0'
          tabs={tabs}
          withHashIntegration={false}
          hideBeforeHashLoaded
          tabsRightElement={tab === 1 ? <WithdrawTxButton /> : null}
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
