import BaseAvatar from 'src/components/utils/DfAvatar'
import Button from '../tailwind-components/Button'
import clsx from 'clsx'
import StakeButton from './StakeButton'
import { useCreatorSpaceById } from '../../../rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import TruncatedText from '../tailwind-components/TruncateText'
import { useEraStakesById } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { FormatBalance } from 'src/components/common/balances'
import { useStakerInfo } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'

type CreatorPreviewProps = {
  title: string
  imgSize?: number
  desc?: React.ReactNode
  owner?: string
  avatar?: string
  titleClassName?: string
  descClassName?: string
}

export const CreatorPreview = ({
  desc,
  imgSize = 40,
  avatar,
  owner,
  title,
  titleClassName,
  descClassName,
}: CreatorPreviewProps) => {
  return (
    <div className='flex items-center'>
      <BaseAvatar size={imgSize} address={owner} avatar={avatar} />
      <div>
        <div className={clsx('leading-5 font-medium', titleClassName)}>
          {title}
        </div>
        {desc && <div className={descClassName}>{desc}</div>}
      </div>
    </div>
  )
}

type CreatorCardTotalValueProps = {
  label: string
  value: React.ReactNode
}

const CreatorCardTotalValue = ({
  label,
  value,
}: CreatorCardTotalValueProps) => {
  return (
    <div className='flex justify-between items-center'>
      <div className='text-text-muted font-normal text-sm leading-6'>
        {label}:
      </div>
      <div className='text-sm font-medium leading-6'>{value}</div>
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
  const chainsInfo = useChainInfo()
  const stakerInfo = useStakerInfo(spaceId, myAddress)

  const { tokenDecimals, tokenSymbols, nativeToken } =
    chainsInfo?.subsocial || {}

  const decimal = tokenDecimals?.[0] || 0
  const symbol = tokenSymbols?.[0] || nativeToken

  const { loading, space } = creatorSpaceEntity || {}
  const { numberOfStakers, total } = eraStake?.info || {}
  const { totalStaked } = stakerInfo?.info || {}

  const isStake = totalStaked === '0'

  if (!loading && !space) return null

  const { name, about, ownedByAccount, image } = space || {}

  const owner = ownedByAccount?.id

  const totalStake = (
    <FormatBalance
      value={total}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
      isShort={true}
    />
  )

  const myStake = (
    <FormatBalance
      value={totalStaked}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
      isShort={true}
    />
  )

  return (
    <div
      className={clsx(
        'p-4 bg-slate-50 rounded-2xl border-2 border-border-gray-light',
        'flex flex-col gap-4'
      )}
    >
      <div className='flex flex-col gap-2'>
        <div className='flex justify-between gap-2'>
          <CreatorPreview
            title={name || '<Unnamed>'}
            desc='social links'
            avatar={image}
            owner={owner}
          />
          <Button variant='primaryOutline' size='circle' className='h-fit'>
            <img src='/images/creator-staking/messenger.svg' alt='' />
          </Button>
        </div>
        <div className='flex items-center text-sm text-text-muted leading-[22px] font-normal min-h-[44px]'>
          <TruncatedText text={about || ''} />
        </div>
        <div className='border-b border-[#D4E2EF]'></div>
        <div className='flex flex-col gap-[2px]'>
          <CreatorCardTotalValue label='My stake' value={totalStaked !== '0' ? myStake : '-'} />
          <CreatorCardTotalValue label='Total stake' value={totalStake} />
          <CreatorCardTotalValue label='Stakers' value={numberOfStakers} />
        </div>
      </div>
      <div className='flex gap-4'>
        <StakeButton isStake={isStake} />
        {!isStake && (
          <Button variant='outlined' className='w-full' size='sm'>
            Unstake
          </Button>
        )}
      </div>
    </div>
  )
}

export default CreatorCard
