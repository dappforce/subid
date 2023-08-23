import { useState } from 'react'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'
import CardWrapper from '../utils/CardWrapper'
import Button from '../tailwind-components/Button'
import {
  useFetchStakerLedger,
  useStakerLedger,
} from '../../../rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { FormatBalance } from 'src/components/common/balances'
import store from 'store'

type RewardCardProps = {
  title: string
  value: React.ReactNode
  desc?: string
  button?: React.ReactNode
}

const RewardCard = ({ title, value, desc, button }: RewardCardProps) => {
  return (
    <CardWrapper className='bg-slate-50'>
      <div className='text-text-muted font-normal'>{title}</div>
      <div className='flex justify-between items-center'>
        <div>
          <div className='text-2xl font-semibold'>{value}</div>
          {desc && (
            <div className='font-normal text-text-muted text-sm'>{desc}</div>
          )}
        </div>
        {button}
      </div>
    </CardWrapper>
  )
}

type RestakeButtonProps = {
  restake: boolean
  setRestake: (restake: boolean) => void
}

const RestakeButton = ({ restake, setRestake }: RestakeButtonProps) => {

  const onButtonClick = (restake: boolean) => {
    setRestake(!restake)
    store.set('RestakeAfterClaim', !restake)
  }

  return (
    <Button size={'sm'} variant={'primaryOutline'} onClick={() => onButtonClick(restake)}>
      {restake ? 'Turn off' : 'Turn on'}
    </Button>
  )
}

const MyRewards = () => {
  const restakeStateFromStorage = store.get('RestakeAfterClaim')
  const [ restake, setRestake ] = useState(restakeStateFromStorage)
  const myAddress = useMyAddress()
  const chainsInfo = useChainInfo()

  const stakerLedger = useStakerLedger(myAddress)

  const { tokenDecimals, tokenSymbols, nativeToken } =
    chainsInfo?.subsocial || {}

  const decimal = tokenDecimals?.[0] || 0
  const symbol = tokenSymbols?.[0] || nativeToken

  const { locked } = stakerLedger?.ledger || {}

  const myStake = (
    <FormatBalance
      value={locked}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
    />
  )

  const cardsOpt = [
    {
      title: 'My Stake',
      value: myStake,
      desc: 'SOON',
    },
    {
      title: 'Estimated Rewards',
      value: 'SOON',
      desc: 'SOON',
      button: (
        <Button disabled size={'sm'} variant={'primary'}>
          Claim
        </Button>
      ),
    },
    {
      title: 'Re-Stake After Claiming',
      value: <div className='font-semibold'>{restake ? 'ON' : 'OFF'}</div>,
      button: (
        <RestakeButton restake={restake} setRestake={setRestake} />
      ),
    },
  ]

  const stakingCards = cardsOpt.map((card, i) => (
    <RewardCard key={i} {...card} />
  ))

  return <div className='flex gap-4'>{stakingCards}</div>
}

const MyStakingSection = () => {
  const myAddress = useMyAddress()
  const [ tab, setTab ] = useState(0)

  useFetchStakerLedger(myAddress)

  const tabs: TabsProps['tabs'] = [
    {
      id: 'my-rewards',
      text: 'My Rewards',
      content: () => <MyRewards />,
    },
    {
      id: 'unstaking',
      text: 'Unstaking',
      content: () => <></>,
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
