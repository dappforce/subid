import { useState } from 'react'
import Button from '../tailwind-components/Button'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'

const CreatorCard = () => {
  return <div className='p-4 bg-slate-50 rounded-2xl border-2 border-border-gray-light'>

  </div>
}

const AllCreators = () => {
  const creatorsCards = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ].map((i) => <CreatorCard key={i}/>)

  return <div className='grid grid-cols-3 gap-4 px-6'>
    {creatorsCards}
  </div>
}

const CreatorsSection = () => {
  const [ tab, setTab ] = useState(0)

  const tabs: TabsProps['tabs'] = [
    {
      id: 'all-creators',
      text: 'All Creators',
      content: () => (
        <AllCreators />
      ),
    },
    {
      id: 'my-creators',
      text: 'My Creators',
      content: () => <></>,
    },
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center px-6'>
        <div className='text-2xl UnboundedFont'>My Staking</div>
        <div className='flex gap-4 items-center'>
          <div>Are you a creator?</div>
          <Button variant='primaryOutline' size={'sm'}>Apply to join</Button>
        </div>
      </div>

      <div className='w-full flex flex-col gap-4 bg-white rounded-[20px] py-6'>
        <Tabs
          className='px-6'
          panelClassName='mt-0 px-0'
          tabs={tabs}
          withHashIntegration={false}
          hideBeforeHashLoaded
          withDivider
          manualTabControl={{
            selectedTab: tab,
            setSelectedTab: (selectedTab) => setTab(selectedTab),
          }}
        />
      </div>
    </div>
  )
}

export default CreatorsSection