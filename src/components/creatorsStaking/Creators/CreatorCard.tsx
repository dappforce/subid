import BaseAvatar from 'src/components/utils/DfAvatar'
import Button from '../tailwind-components/Button'
import clsx from 'clsx'
import StakeActionButtons from './StakeActionButtons'
import { useCreatorSpaceById } from '../../../rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import TruncatedText from '../tailwind-components/TruncateText'
import { useEraStakesById } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { FormatBalance } from 'src/components/common/balances'
import { useStakerInfo } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import AboutModal from './modals/AboutModal'
import { useState } from 'react'
import StakingModal, { StakingModalVariant } from './modals/StakeModal'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { ContactInfo } from '../utils/socialLinks'
import { useGetDecimalsAndSymbolByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'

type CreatorPreviewProps = {
  title?: string
  imgSize?: number
  desc?: React.ReactNode
  owner?: string
  avatar?: string
  titleClassName?: string
  descClassName?: string
  infoClassName?: string
}

export const CreatorPreview = ({
  desc,
  imgSize = 40,
  avatar,
  owner,
  title,
  titleClassName,
  descClassName,
  infoClassName
}: CreatorPreviewProps) => {
  return (
    <div className='flex items-center'>
      <BaseAvatar
        style={{ cursor: 'pointer' }}
        size={imgSize}
        address={owner}
        avatar={avatar}
      />
      <div className={infoClassName}>
        <div className={clsx('leading-5 font-medium', titleClassName)}>
          {title || '<Unnamed>'}
        </div>
        {desc && <div className={descClassName}>{desc}</div>}
      </div>
    </div>
  )
}

type CreatorCardTotalValueProps = {
  label: string
  value: React.ReactNode
  loading?: boolean
}

const CreatorCardValue = ({
  label,
  value,
  loading,
}: CreatorCardTotalValueProps) => {
  return (
    <div className='flex justify-between items-center'>
      <div className='text-text-muted font-normal text-sm leading-6'>
        {label}:
      </div>
      <div className='text-sm font-medium leading-6'>
        <ValueOrSkeleton
          value={value}
          loading={loading}
          skeletonClassName='w-28 h-[16px]'
        />
      </div>
    </div>
  )
}

type CreatorCardProps = {
  spaceId: string
  era?: string
}

const CreatorCard = ({ spaceId, era }: CreatorCardProps) => {
  const myAddress = useMyAddress()
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)
  const eraStake = useEraStakesById(spaceId, era)
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')
  const stakerInfo = useStakerInfo(spaceId, myAddress)
  const [ opneAboutModal, setOpenAboutModal ] = useState(false)
  const [ openStakeModal, setOpenStakeModal ] = useState(false)
  const [ modalVariant, setModalVariant ] = useState<StakingModalVariant>('stake')

  const { space, loading: _spaceLoading } = creatorSpaceEntity || {}
  const { info: eraStakeInfo, loading: eraStakeLoading } = eraStake || {}
  const { info, loading: stakerInfoLoading } = stakerInfo || {}

  const { numberOfStakers, total } = eraStakeInfo || {}
  const { totalStaked } = info || {}

  const isStake = totalStaked === '0'

  const { name, about, ownedByAccount, image, links, email } = space || {}

  const owner = ownedByAccount?.id

  const totalStake = (
    <FormatBalance
      value={total}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const myStake = (
    <FormatBalance
      value={totalStaked}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const contactInfo = { email, links }

  return (
    <div
      className={clsx(
        'p-4 bg-slate-50 rounded-2xl border-2 border-border-gray-light',
        'flex flex-col justify-between gap-4'
      )}
    >
      <div className='flex flex-col gap-2'>
        <div className='cursor-pointer' onClick={() => setOpenAboutModal(true)}>
          <div className='flex justify-between gap-2'>
            <CreatorPreview
              title={name || '<Unnamed>'}
              desc={<ContactInfo {...contactInfo} />}
              avatar={image}
              owner={owner}
              infoClassName='flex flex-col gap-1'
            />
            <Button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
              variant='primaryOutline'
              size='circle'
              className='h-fit'
            >
              <img src='/images/creator-staking/messenger.svg' alt='' />
            </Button>
          </div>
          <div className='flex items-center text-sm text-text-muted leading-[22px] font-normal min-h-[44px]'>
            <TruncatedText text={about || ''} />
          </div>
        </div>
        <div className='border-b border-[#D4E2EF]'></div>
        <div className='flex flex-col gap-[2px]'>
          <CreatorCardValue
            label='My stake'
            value={myStake}
            loading={stakerInfoLoading}
          />
          <CreatorCardValue
            label='Total stake'
            value={totalStake}
            loading={eraStakeLoading}
          />
          <CreatorCardValue
            label='Stakers'
            value={numberOfStakers}
            loading={eraStakeLoading}
          />
        </div>
      </div>
      <StakeActionButtons
        spaceId={spaceId}
        isStake={isStake}
        buttonsSize='sm'
        openModal={() => setOpenStakeModal(true)}
        setModalVariant={setModalVariant}
      />
      <AboutModal
        open={opneAboutModal}
        closeModal={() => setOpenAboutModal(false)}
        spaceId={spaceId}
        isStake={isStake}
      />
      <StakingModal
        open={openStakeModal}
        closeModal={() => setOpenStakeModal(false)}
        spaceId={spaceId}
        modalVariant={modalVariant}
        setModalVariant={setModalVariant}
      />
    </div>
  )
}

export default CreatorCard
