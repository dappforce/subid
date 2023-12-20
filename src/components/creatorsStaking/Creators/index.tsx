import { useState, useEffect, useMemo } from 'react'
import Button from '../tailwind-components/Button'
import Tabs, { TabsProps } from '../tailwind-components/Tabs'
import CreatorCard from './CreatorCard'
import { useCreatorsList } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { useFetchCreatorsSpaces } from '../../../rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import { useFetchEraStakes } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { useFetchBackerInfoBySpaces } from '../../../rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import {
  useIsMulti,
  useMyAddress,
} from 'src/components/providers/MyExtensionAccountsContext'
import { useFetchBalanceByNetwork } from 'src/rtk/features/balances/balancesHooks'
import SortByDropDown from './SortByDropDown'
import { useGetMyCreatorsIds } from '../hooks/useGetMyCreators'
import { useSortBy } from '../hooks/useSortCreators'
import { isEmptyArray } from '@subsocial/utils'
import Loading from '../tailwind-components/Loading'
import { ModalContextWrapper, useModalContext } from '../contexts/ModalContext'
import SuccessModal from './modals/SuccessModal'
import { toGenericAccountId } from 'src/rtk/app/util'
import { betaVersionAgreementStorageName } from './modals/StakeModal'
import store from 'store'
import DefaultAboutModal from './modals/DefaultAboutModal'
import { useSendEvent } from '@/components/providers/AnalyticContext'

// const DEFAULT_PAGE_SIZE = 9

type AllCreatorsProps = {
  spaceIds?: string[]
  era?: string
  sortBy: string
}

const CreatorsCards = ({
  spaceIds,
  era,
  sortBy,
  ...modalProps
}: AllCreatorsProps) => {
  // const [ page, setPage ] = useState(1)
  const sortedSpaceIds = useSortBy(sortBy, spaceIds, era)

  const ids =
    sortedSpaceIds && !isEmptyArray(sortedSpaceIds) ? sortedSpaceIds : spaceIds

  if (!ids || isEmptyArray(ids))
    return (
      <div className='h-[261px] flex items-center justify-center'>
        <Loading />
      </div>
    )

  const creatorsCards = ids.map((spaceId, i) => (
    <CreatorCard key={i} spaceId={spaceId} era={era} {...modalProps} />
  ))

  // const start = (page - 1) * DEFAULT_PAGE_SIZE
  // const end = start + DEFAULT_PAGE_SIZE

  // const creatorsCardsByPage = creatorsCards.slice(start, end)

  return (
    <div>
      <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 md:px-6 px-4'>
        {creatorsCards}
      </div>
      {/* <Pagination
        current={page}
        pageSize={DEFAULT_PAGE_SIZE}
        total={creatorsCards.length}
        onChange={(page) => setPage(page)}
        className='md:px-6 p-4'
      /> */}
    </div>
  )
}

type CreatorsSectionInnerProps = CreatorsSectionProps & {
  spaceIds?: string[]
  era?: string
}

const CreatorsSectionInner = ({
  spaceIds,
  era,
  defaultSpaceId,
}: CreatorsSectionInnerProps) => {
  const [ tab, setTab ] = useState(0)
  const myAddress = useMyAddress()
  const [ sortBy, changeSortBy ] = useState('default')
  const { showSuccessModal, setShowSuccessModal, amount, stakedSpaceId } =
    useModalContext()
  const creatorsList = useCreatorsList()
  const isMulti = useIsMulti()
  const sendEvent = useSendEvent()

  const isCreator = useMemo(
    () =>
      !!creatorsList?.find(
        (item) => toGenericAccountId(item.creator.stakeholder) === myAddress
      ),
    [ creatorsList?.length ]
  )

  const myCreatorsIds = useGetMyCreatorsIds(spaceIds)

  useEffect(() => {
    if (myCreatorsIds.length > 0) {
      store.set(betaVersionAgreementStorageName, true)
    } else {
      store.set(betaVersionAgreementStorageName, false)
    }
  }, [ myCreatorsIds.length, myAddress ])

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
      text: `My Creators (${isMulti ? 0 : myCreatorsIds.length || 0})`,
      content: () => (
        <CreatorsCards spaceIds={myCreatorsIds} era={era} sortBy={sortBy} />
      ),
      disabled: myCreatorsIds.length === 0 || isMulti,
    },
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex md:flex-row flex-col justify-between md:items-center items-start gap-4 md:px-6 px-0'>
        <div className='text-2xl UnboundedFont'>Creators</div>
        {!isCreator && (
          <div className='flex gap-4 items-center'>
            <div>Are you a creator?</div>
            <Button
              variant='primaryOutline'
              href='https://forms.gle/t3YfTtGnbVdwm7kY8'
              target='_blank'
              size={'sm'}
              onClick={() => sendEvent('cs_apply_as_creator_clicked')}
            >
              Apply to join
            </Button>
          </div>
        )}
      </div>

      <div className='w-full flex flex-col gap-4 bg-white rounded-[20px] md:py-6 py-4'>
        <Tabs
          className='md:px-6 px-4'
          panelClassName='mt-0 px-0'
          tabs={tabs}
          withHashIntegration={false}
          tabsRightElement={
            <SortByDropDown
              sortBy={sortBy}
              changeSortBy={(sortBy) => {
                sendEvent('cs_filter_changed', { type: sortBy })
                changeSortBy(sortBy)
              }}
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
      <SuccessModal
        open={showSuccessModal}
        closeModal={() => setShowSuccessModal(false)}
        spaceId={stakedSpaceId || '0'}
        tokenSymbol={'SUB'}
        amount={amount}
      />
      <DefaultAboutModal defaultSpaceId={defaultSpaceId} />
    </div>
  )
}

type CreatorsSectionProps = {
  defaultSpaceId?: string
}

const CreatorsSection = ({ defaultSpaceId }: CreatorsSectionProps) => {
  const myAddress = useMyAddress()
  const creatorsList = useCreatorsList()
  const eraInfo = useGeneralEraInfo()

  const creatorsSpaceIds = creatorsList?.map((creator) => creator.id)
  const currentEra = eraInfo?.info?.currentEra

  useFetchCreatorsSpaces(creatorsSpaceIds)
  useFetchEraStakes(creatorsSpaceIds, currentEra)
  useFetchBackerInfoBySpaces(creatorsSpaceIds, myAddress)
  useFetchBalanceByNetwork({ network: 'subsocial', address: myAddress })

  return (
    <ModalContextWrapper>
      <CreatorsSectionInner
        defaultSpaceId={defaultSpaceId}
        spaceIds={creatorsSpaceIds}
        era={currentEra}
      />
    </ModalContextWrapper>
  )
}

export default CreatorsSection
