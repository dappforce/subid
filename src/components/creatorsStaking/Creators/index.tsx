import { useMemo, useState } from 'react'
import Button from '../tailwind-components/Button'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'
import CreatorCard from './CreatorCard'
import Pagination from '../tailwind-components/Pagination'
import FloatingMenus from '../tailwind-components/floating/FloatingMenus'
import clsx from 'clsx'
import { HiChevronDown } from 'react-icons/hi2'
import { useCreatorsList } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { useFetchCreatorsSpaces } from '../../../rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import { useFetchEraStakes } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import {
  useFetchStakerInfoBySpaces,
  useStakerInfoBySpaces,
} from '../../../rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useFetchBalanceByNetwork } from 'src/rtk/features/balances/balancesHooks'
import BN from 'bignumber.js'
import { isEmptyObj } from '@subsocial/utils'

const DEFAULT_PAGE_SIZE = 9

type AllCreatorsProps = {
  spaceIds?: string[]
  era?: string
}

const CreatorsCards = ({ spaceIds, era }: AllCreatorsProps) => {
  const [ page, setPage ] = useState(1)

  const creatorsCards =
    spaceIds?.map((spaceId, i) => (
      <CreatorCard key={i} spaceId={spaceId} era={era} />
    )) || []

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

type SortDropdownProps = {
  sortBy: string
  changeSortBy: (sortBy: string) => void
}

const SortDropdown = ({ sortBy, changeSortBy }: SortDropdownProps) => {
  const menus = [
    {
      text: 'Total stake',
      onClick: () => changeSortBy('total stake'),
    },
    {
      text: 'Stakers',
      onClick: () => changeSortBy('stakers'),
    },
    {
      text: 'My stake',
      onClick: () => changeSortBy('my stake'),
    },
  ]

  return (
    <div className='flex items-center gap-2'>
      <span className='text-text-muted'>Sort by:</span>
      <FloatingMenus
        menus={menus}
        allowedPlacements={[ 'bottom-start' ]}
        mainAxisOffset={4}
        panelSize='xs'
      >
        {(config) => {
          const { referenceProps, toggleDisplay, isOpen } = config || {}
          return (
            <div
              {...referenceProps}
              onClick={toggleDisplay}
              className='flex cursor-pointer items-center gap-1 text-text-primary'
            >
              <span>{sortBy}</span>
              <HiChevronDown
                className={clsx('transition-transform', isOpen && 'rotate-180')}
              />
            </div>
          )
        }}
      </FloatingMenus>
    </div>
  )
}

type CreatorsSectionInnerProps = {
  spaceIds?: string[]
  era?: string
}

const CreatorsSectionInner = ({ spaceIds, era }: CreatorsSectionInnerProps) => {
  const [ tab, setTab ] = useState(0)
  const [ sortBy, changeSortBy ] = useState('total stake')
  const myAddress = useMyAddress()

  const stakerInfo = useStakerInfoBySpaces(spaceIds, myAddress)

  console.log('stakerInfo', stakerInfo)

  const myCreatorsIds = useMemo(() => {
    if (!stakerInfo || isEmptyObj(stakerInfo)) return []

    const stakerInfoEntries = Object.entries(stakerInfo)

    return stakerInfoEntries
      .filter(([ _, info ]) => !new BN(info.totalStaked).isZero())
      .map(([ key ]) => key)
  }, [ isEmptyObj(stakerInfo) ])

  const tabs: TabsProps['tabs'] = [
    {
      id: 'all-creators',
      text: 'All Creators',
      content: () => <CreatorsCards spaceIds={spaceIds} era={era} />,
    },
    {
      id: 'my-creators',
      text: `My Creators (${myCreatorsIds.length || 0})`,
      content: () => <CreatorsCards spaceIds={myCreatorsIds} era={era} />,
      disabled: myCreatorsIds.length === 0,
    },
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center px-6'>
        <div className='text-2xl UnboundedFont'>Creators</div>
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
          tabsRightElement={
            <SortDropdown sortBy={sortBy} changeSortBy={changeSortBy} />
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
