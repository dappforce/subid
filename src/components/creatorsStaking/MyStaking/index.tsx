import { useState } from 'react'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'
import CardWrapper from '../utils/CardWrapper'
import Button from '../tailwind-components/Button'
import { useFetchEraStakes } from '../../../rtk/features/creatorStaking/eraStake/eraStakeHooks';

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
          {desc && <div className='font-normal text-text-muted text-sm'>{desc}</div>}
        </div>
        {button}
      </div>
    </CardWrapper>
  )
}

const cardsOpt = [
  {
    title: 'My Stake',
    value: '3,340.49 SUB',
    desc: '$1,680.67',
  },
  {
    title: 'Estimated Rewards',
    value: '150.04 SUB',
    desc: '48 Eras',
    button: <Button size={'sm'} variant={'primary'}>Claim</Button>
  },
  {
    title: 'Re-Stake After Claiming',
    value: <div className='font-semibold'>ON</div>,
    button: <Button size={'sm'} variant={'primaryOutline'}>Turn off</Button>
  }
]

const MyRewards = () => {
  const stakingCards = cardsOpt.map((card, i) => <RewardCard key={i} {...card} />)

  return (
    <div className='flex gap-4'>{stakingCards}</div>
  )
}

const MyStakingSection = () => {
  const [ tab, setTab ] = useState(0)

  const tabs: TabsProps['tabs'] = [
    {
      id: 'my-rewards',
      text: 'My Rewards',
      content: () => (
        <MyRewards />
      ),
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
