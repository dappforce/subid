import BaseAvatar from 'src/components/utils/DfAvatar'
import Button from '../tailwind-components/Button'
import clsx from 'clsx'
import StakeButton from './StakeButton'

const address = '5FToy6nuBv7p6EtTHd2xW8neztzSTpPjtwMevTyBw6j91QKe'

type CreatorPreviewProps = {
  title?: string
  imgSize?: number
  desc?: React.ReactNode
  avatar?: string
  titleClassName?: string
  descClassName?: string
}

export const CreatorPreview = ({ 
  desc, 
  imgSize = 40, 
  avatar, 
  title,
  titleClassName,
  descClassName,
}: CreatorPreviewProps) => {
  return (
    <div className='flex items-center'>
      <BaseAvatar
        size={imgSize}
        address={address}
        avatar={avatar}
      />
      <div>
        <div className={clsx('leading-5 font-medium', titleClassName)}>{title}</div>
        {desc && <div className={descClassName}>{desc}</div>}
      </div>
    </div>
  )
}

type CreatorCardTotalValueProps = {
  label: string
  value: string
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
  isStake: boolean
}

const CreatorCard = ({ isStake }: CreatorCardProps) => {
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
            title={'Elon Musk'} 
            desc='social links' 
            avatar='/images/creator-staking/tmp-image.png'
          />
          <Button variant='primaryOutline' size='circle' className='h-fit'>
            <img src='/images/creator-staking/messenger.svg' alt='' />
          </Button>
        </div>
        <div className='text-sm text-text-muted leading-[22px] font-normal'>
          Father of SpaceX and Tesla. Recently adopted Twitter.
        </div>
        <div className='border-b border-[#D4E2EF]'></div>
        <div className='flex flex-col gap-[2px]'>
          <CreatorCardTotalValue label='My stake' value='350.40 SUB' />
          <CreatorCardTotalValue label='Total stake' value='10,320.45 SUB' />
          <CreatorCardTotalValue label='Stakers' value='4,794' />
        </div>
      </div>
      <div className='flex gap-4'>
        <StakeButton isStake={isStake} />
        {!isStake && <Button variant='outlined' className='w-full' size='sm'>Unstake</Button>}
      </div>
    </div>
  )
}

export default CreatorCard
