import clsx from 'clsx'
import StakeActionButtons from './StakeActionButtons'
import { useCreatorSpaceById } from '../../../rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import TruncatedText from '../tailwind-components/TruncateText'
import { useEraStakesById } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { FormatBalance } from 'src/components/common/balances'
import { useBackerInfo } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import AboutModal from './modals/AboutModal'
import { useState } from 'react'
import StakingModal, { StakingModalVariant } from './modals/StakeModal'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { ContactInfo } from '../utils/socialLinks'
import { useGetDecimalsAndSymbolByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'
import { CreatorPreview } from '../utils/CreatorPreview'
import { useModalContext } from '../contexts/ModalContext'
import Button from '../tailwind-components/Button'
import { useChatContext } from 'src/components/providers/ChatContext'
import { Tooltip } from 'antd'

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
    <div className='flex justify-between items-center gap-2'>
      <div className='text-text-muted font-normal min-w-fit text-sm leading-6'>
        {label}:
      </div>
      <div className='text-sm font-medium leading-6 text-end w-full'>
        <ValueOrSkeleton
          value={value}
          loading={loading}
          skeletonClassName='h-[16px]'
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
  const { amount, setAmount } = useModalContext()
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)
  const eraStake = useEraStakesById(spaceId, era)
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')
  const backerInfo = useBackerInfo(spaceId, myAddress)
  const [ openAboutModal, setOpenAboutModal ] = useState(false)
  const [ openStakeModal, setOpenStakeModal ] = useState(false)
  const [ modalVariant, setModalVariant ] = useState<StakingModalVariant>('stake')
  const { setOpen, setSpaceId, setMetadata } = useChatContext()

  const { space, loading: spaceLoading } = creatorSpaceEntity || {}
  const { info: eraStakeInfo, loading: eraStakeLoading } = eraStake || {}
  const { info, loading: backerInfoLoading } = backerInfo || {}

  const { backersCount, totalStaked: total } = eraStakeInfo || {}
  const { totalStaked } = info || {}

  const isStake = totalStaked === '0'

  const { name, about, ownedByAccount, image, links, email } = space || {}

  const owner = ownedByAccount?.id

  const totalStake = (
    <FormatBalance
      value={total || '0'}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const myStake =
    totalStaked && !isStake ? (
      <FormatBalance
        value={totalStaked}
        decimals={decimal}
        currency={tokenSymbol}
        isGrayDecimal={false}
      />
    ) : (
      <>-</>
    )

  const aboutText = (
    <div
      className={clsx(
        'flex items-center text-sm',
        'text-text-muted leading-[22px]',
        'font-normal min-h-[44px] w-full'
      )}
    >
      <ValueOrSkeleton
        value={<TruncatedText text={about || ''} />}
        loading={spaceLoading}
        skeletonClassName='w-full h-[16px]'
      />
    </div>
  )

  const contactInfo = { email, links }

  const onChatButtonClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()

    if (name) {
      setOpen(true)
      setSpaceId(spaceId)
      setMetadata({
        title: name,
        body: about || '',
        image: image || '',
      })
    }
  }

  return (
    <>
      <div
        className={clsx(
          'p-4 bg-slate-50 rounded-2xl border-2 border-slate-50 hover:border-border-gray-light',
          'flex flex-col justify-between gap-4'
        )}
      >
        <div className='flex flex-col gap-2'>
          <div
            className='cursor-pointer'
            onClick={() => setOpenAboutModal(true)}
          >
            <div className='w-full flex justify-between gap-2'>
              <CreatorPreview
                title={
                  <ValueOrSkeleton
                    value={name || '<Unnamed>'}
                    loading={spaceLoading}
                    skeletonClassName='w-full h-[16px]'
                    className='whitespace-nowrap'
                  />
                }
                desc={<ContactInfo {...contactInfo} />}
                avatar={image}
                owner={owner}
                descClassName='p-[1px]'
                infoClassName='flex flex-col gap-1'
              />

              <div>
                <Tooltip title='Community chat'>
                  <Button
                    onClick={onChatButtonClick}
                    variant='primaryOutline'
                    size='circle'
                    className='h-[31px] w-[31px]'
                  >
                    <img src='/images/creator-staking/messenger.svg' alt='' />
                  </Button>
                </Tooltip>
              </div>
            </div>
            {aboutText}
          </div>
          <div className='border-b border-[#D4E2EF]'></div>
          <div className='flex flex-col gap-[2px]'>
            <CreatorCardValue
              label='My stake'
              value={myStake}
              loading={backerInfoLoading}
            />
            <CreatorCardValue
              label='Total stake'
              value={totalStake}
              loading={eraStakeLoading}
            />
            <CreatorCardValue
              label='Stakers'
              value={backersCount || '0'}
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
      </div>
      <AboutModal
        open={openAboutModal}
        closeModal={() => setOpenAboutModal(false)}
        spaceId={spaceId}
        isStake={isStake}
        amount={amount}
        setAmount={setAmount}
      />
      <StakingModal
        open={openStakeModal}
        closeModal={() => setOpenStakeModal(false)}
        spaceId={spaceId}
        modalVariant={modalVariant}
        amount={amount}
        setAmount={setAmount}
      />
    </>
  )
}

export default CreatorCard
