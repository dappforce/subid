import { useState } from 'react'
import Button from '../tailwind-components/Button'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'
import CreatorCard from './CreatorCard'
import Pagination from '../tailwind-components/Pagination'
import { useCreatorsList } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { useFetchCreatorsSpaces } from '../../../rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import {
  useFetchEraStakes,
} from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import {
  useFetchStakerInfoBySpaces,
} from '../../../rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useFetchBalanceByNetwork } from 'src/rtk/features/balances/balancesHooks'
import SortByDropDown from './SortByDropDown'
import { useGetMyCreatorsIds } from '../hooks/useGetMyCreators'
import { useSortBy } from '../hooks/useSortCreators'

const DEFAULT_PAGE_SIZE = 9

type AllCreatorsProps = {
  spaceIds?: string[]
  era?: string
  sortBy: string
}

const CreatorsCards = ({ spaceIds, era, sortBy }: AllCreatorsProps) => {
  const [ page, setPage ] = useState(1)
  const sortedSpaceIds = useSortBy(sortBy, spaceIds, era)

  const creatorsCards =
    sortedSpaceIds?.map((spaceId, i) => (
      <CreatorCard key={i} spaceId={spaceId} era={era} />
    )) || []

  const start = (page - 1) * DEFAULT_PAGE_SIZE
  const end = start + DEFAULT_PAGE_SIZE

  const creatorsCardsByPage = creatorsCards.slice(start, end)

  return (
    <div>
      <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 md:px-6 px-4'>
        {creatorsCardsByPage}
      </div>
      <Pagination
        current={page}
        pageSize={DEFAULT_PAGE_SIZE}
        total={creatorsCards.length}
        onChange={(page) => setPage(page)}
        className='md:px-6 p-4'
      />
    </div>
  )
}

type CreatorsSectionInnerProps = {
  spaceIds?: string[]
  era?: string
}

const CreatorsSectionInner = ({ spaceIds, era }: CreatorsSectionInnerProps) => {
  const [ tab, setTab ] = useState(0)
  const [ sortBy, changeSortBy ] = useState('total-stake')
  const myCreatorsIds = useGetMyCreatorsIds(spaceIds)

  const tabs: TabsProps['tabs'] = [
    {
      id: 'all-creators',
      text: 'All Creators',
      content: () => (
        <CreatorsCards spaceIds={spaceIds} era={era} sortBy={sortBy} />
      ),
    },
    {
      id: 'my-creators',
      text: `My Creators (${myCreatorsIds.length || 0})`,
      content: () => (
        <CreatorsCards spaceIds={myCreatorsIds} era={era} sortBy={sortBy} />
      ),
      disabled: myCreatorsIds.length === 0,
    },
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex md:flex-row flex-col justify-between md:items-center items-start gap-4 md:px-6 px-0'>
        <div className='text-2xl UnboundedFont'>Creators</div>
        <div className='flex gap-4 items-center'>
          <div>Are you a creator?</div>
          <Button variant='primaryOutline' size={'sm'}>
            Apply to join
          </Button>
        </div>
      </div>

      <div className='w-full flex flex-col gap-4 bg-white rounded-[20px] md:py-6 py-4'>
        <Tabs
          className='px-6'
          panelClassName='mt-0 px-0'
          tabs={tabs}
          withHashIntegration={false}
          tabsRightElement={
            <SortByDropDown 
              sortBy={sortBy}
              changeSortBy={changeSortBy}
              panelSize='xs'
              panelClassName='!w-32' 
              itemClassName='my-[2px]'
            />
          }
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

const CreatorsSection = () => {
  const myAddress = useMyAddress()
  const creatorsList = useCreatorsList()
  const eraInfo = useGeneralEraInfo()

  const creatorsSpaceIds = creatorsList?.map((creator) => creator.id)
  const currentEra = eraInfo?.currentEra

  useFetchCreatorsSpaces(creatorsSpaceIds)
  useFetchEraStakes(creatorsSpaceIds, currentEra)
  useFetchStakerInfoBySpaces(creatorsSpaceIds, myAddress)
  useFetchBalanceByNetwork('subsocial', myAddress)

  return <CreatorsSectionInner spaceIds={creatorsSpaceIds} era={currentEra} />
}

export default CreatorsSection
