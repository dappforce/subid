import { useState } from 'react'
import Button from '../tailwind-components/Button'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'
import CreatorCard from './CreatorCard'
import Pagination from '../tailwind-components/Pagination'

const DEFAULT_PAGE_SIZE = 9

const AllCreators = () => {
  const [ page, setPage ] = useState(1)

  const creatorsCards = [
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
  ].map((value, i) => <CreatorCard key={i} isStake={value} />)

  const start = (page - 1) * DEFAULT_PAGE_SIZE
  const end = start + DEFAULT_PAGE_SIZE

  const creatorsCardsByPage = creatorsCards.slice(start, end)

  return (
    <div>
      <div className='grid grid-cols-3 gap-4 px-6'>{creatorsCardsByPage}</div>
      <Pagination 
        defaultCurrent={1}
        current={page}
        pageSize={DEFAULT_PAGE_SIZE}
        total={creatorsCards.length}
        onChange={(page) => setPage(page)}
        className='px-6' 
      />
    </div>
  )
}

const CreatorsSection = () => {
  const [ tab, setTab ] = useState(0)

  const tabs: TabsProps['tabs'] = [
    {
      id: 'all-creators',
      text: 'All Creators',
      content: () => <AllCreators />,
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
          <Button variant='primaryOutline' size={'sm'}>
            Apply to join
          </Button>
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
