import clsx from 'clsx'
import StakeActionButtons from './StakeActionButtons'
import { useCreatorSpaceById } from '../../../rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import TruncatedText from '../tailwind-components/TruncateText'
import { FormatBalance } from 'src/components/common/balances'
import { useBackerInfo } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import AboutModal from './modals/AboutModal'
import { useRef, useState } from 'react'
import StakingModal, { StakingModalVariant } from './modals/StakeModal'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { ContactInfo } from '../utils/socialLinks'
import { useGetDecimalsAndSymbolByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'
import { CreatorPreview } from '../utils/CreatorPreview'
import { useModalContext } from '../contexts/ModalContext'
import Button from '../tailwind-components/Button'
import { useChatContext } from 'src/components/providers/ChatContext'
import { Tooltip } from 'antd'
import FloatingWrapper from '../tailwind-components/floating/FloatingWrapper'
import { pluralize } from '@subsocial/utils'
import { MdArrowOutward } from 'react-icons/md'
// import { useEraStakesById } from '@/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import MoveStakeModal from './modals/MoveStakeModal'
import { useRouter } from 'next/router'
import { useSendEvent } from '@/components/providers/AnalyticContext'

type CreatorNameProps = {
  name?: string
  loading?: boolean
  cardRef: React.RefObject<HTMLDivElement>
}

const CreatorName = ({ name, loading, cardRef }: CreatorNameProps) => {
  const nameRef = useRef<any>(null)

  const isEllipsis = () => {
    if (!nameRef.current || !cardRef.current || !name) return false

    return nameRef.current?.offsetWidth >= cardRef.current?.scrollWidth
  }

  return (
    <FloatingWrapper
      allowedPlacements={[ 'top' ]}
      mainAxisOffset={4}
      panel={() => (
        <div className='rounded-md border border-background-lighter bg-white px-1.5 text-sm py-1'>
          {name}
        </div>
      )}
      showOnHover={isEllipsis()}
    >
      {({ referenceProps, onClick }) => (
        <span
          {...referenceProps}
          onClick={(e) => {
            onClick?.(e)
          }}
        >
          <span ref={nameRef}>
            <ValueOrSkeleton
              value={name || '<Unnamed>'}
              loading={loading}
              skeletonClassName='w-full h-[16px]'
              className='whitespace-nowrap'
            />
          </span>
        </span>
      )}
    </FloatingWrapper>
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

const buildCreatorLinks = (spaceId: string, domain?: string) => {
  const domainName = domain?.replace('.sub', '')

  return `/creators/${domainName ? '@' + domainName : spaceId}`
}

type CreatorCardProps = {
  spaceId: string
  era?: string
}

const CreatorCard = ({ spaceId }: CreatorCardProps) => {
  const myAddress = useMyAddress()
  const { amount, setAmount } = useModalContext()
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)
  // const eraStake = useEraStakesById(spaceId, era)
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')
  const backerInfo = useBackerInfo(spaceId, myAddress)
  const [ openAboutModal, setOpenAboutModal ] = useState(false)
  const [ openStakeModal, setOpenStakeModal ] = useState(false)
  const [ openMoveStakeModal, setOpenMoveStakeModal ] = useState(false)
  const [ modalVariant, setModalVariant ] = useState<StakingModalVariant>('stake')
  const { setOpen, setSpaceId, setMetadata } = useChatContext()
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const sendEvent = useSendEvent()

  const { space, loading: spaceLoading } = creatorSpaceEntity || {}
  // const { info: eraStakeInfo, loading: eraStakeLoading } = eraStake || {}
  const { info, loading: backerInfoLoading } = backerInfo || {}

  // const { backersCount, totalStaked: total } = eraStakeInfo || {}
  const { totalStaked } = info || {}

  const isStake = totalStaked === '0'

  const {
    name,
    about,
    postsCount,
    ownedByAccount,
    image,
    links,
    email,
    domain,
  } = space || {}

  const owner = ownedByAccount?.id

  // const totalStake = (
  //   <FormatBalance
  //     value={total || '0'}
  //     decimals={decimal}
  //     currency={tokenSymbol}
  //     isGrayDecimal={false}
  //   />
  // )

  const myStake =
    totalStaked && !isStake ? (
      <FormatBalance
        value={totalStaked}
        decimals={decimal}
        currency={tokenSymbol}
        isGrayDecimal={false}
      />
    ) : (
      <>—</>
    )

  const aboutText = (
    <div
      className={clsx(
        'flex items-center text-sm',
        'leading-[22px]',
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

  const contactInfo = { email, links: links?.filter((x) => x !== 'null') }

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

      sendEvent('cs_creator_chat_clicked', { value: spaceId })
    }
  }

  const postsLink = (
    <Tooltip title={'See their posts on Polkaverse'}>
      <a
        href={`https://polkaverse.com/${spaceId}`}
        onClick={(e) => {
          e.stopPropagation()
          sendEvent('cs_polkaverse_link_clicked', { value: spaceId })
        }}
        target='_blank'
        rel='noreferrer'
        className={clsx(
          'text-[#64748B] text-sm font-normal hover:text-text-primary w-fit',
          '[&>svg]:hover:text-text-primary leading-none duration-0 flex items-center gap-1'
        )}
      >
        {pluralize({
          count: parseInt(postsCount || '0'),
          singularText: 'post',
        })}
        <MdArrowOutward size={18} className='text-[#64748B80]/50' />
      </a>
    </Tooltip>
  )

  const accountDesc = (
    <div className='flex flex-col gap-2'>
      {!!postsCount && postsLink}
      <ContactInfo
        className={clsx('text-[#64748B]')}
        spaceId={spaceId}
        {...contactInfo}
      />
    </div>
  )

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
            className='cursor-pointer flex flex-col gap-3'
            onClick={() => {
              router.replace(
                '/creators/[creator]',
                buildCreatorLinks(spaceId, domain),
                {
                  scroll: false,
                }
              )

              setOpenAboutModal(true)
              sendEvent('cs_about_modal_opened', { value: spaceId })
            }}
          >
            <div className='w-full flex justify-between gap-2'>
              <CreatorPreview
                title={
                  <CreatorName
                    cardRef={cardRef}
                    name={name}
                    loading={spaceLoading}
                  />
                }
                desc={accountDesc}
                avatar={image}
                owner={owner}
                imgSize={66}
                titleClassName='leading-[20px]'
                descClassName='p-[1px] leading-none w-fit'
                infoClassName='flex flex-col gap-1'
                titleRef={cardRef}
              />

              <div>
                <Tooltip title='Community chat'>
                  <Button
                    onClick={onChatButtonClick}
                    variant='iconPrimary'
                    size='circle'
                    className='h-[20px] w-[20px] !p-0'
                  >
                    <img
                      src='/images/creator-staking/messenger.svg'
                      className='h-[20px] w-[20px]'
                      alt=''
                    />
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
            {/* <CreatorCardValue
              label='Total stake'
              value={totalStake}
              loading={eraStakeLoading}
            />
            <CreatorCardValue
              label='Stakers'
              value={backersCount || '0'}
              loading={eraStakeLoading}
            /> */}
          </div>
        </div>
        <StakeActionButtons
          spaceId={spaceId}
          isStake={isStake}
          buttonsSize='sm'
          openStakeModal={() => setOpenStakeModal(true)}
          setModalVariant={setModalVariant}
          openMoveStakeModal={() => setOpenMoveStakeModal(true)}
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
        eventSource='creator-card'
        modalVariant={modalVariant}
        amount={amount}
        setAmount={setAmount}
      />
      <MoveStakeModal
        open={openMoveStakeModal}
        closeModal={() => setOpenMoveStakeModal(false)}
        defaultCreatorFrom={spaceId}
      />
    </>
  )
}

export default CreatorCard
