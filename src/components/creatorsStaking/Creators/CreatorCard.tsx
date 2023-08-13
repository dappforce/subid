import BaseAvatar from 'src/components/utils/DfAvatar'
import Button from '../tailwind-components/Button'
import clsx from 'clsx'

const address = '5FToy6nuBv7p6EtTHd2xW8neztzSTpPjtwMevTyBw6j91QKe'

const CreatorPreview = () => {
  return (
    <div className='flex items-center'>
      <BaseAvatar
        size={40}
        address={address}
        avatar={'/images/creator-staking/tmp-image.png'}
      />
      <div>
        <div className='leading-5 font-medium'>Elon Musk</div>
        <div>social networks</div>
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
    <div className='flex justify-between'>
      <div className='text-text-muted font-normal text-sm leading-6'>
        {label}:
      </div>
      <div className='text-sm font-medium leading-6'>{value}</div>
    </div>
  )
}

const CreatorCard = () => {
  return (
    <div
      className={clsx(
        'p-4 bg-slate-50 rounded-2xl border-2 border-border-gray-light',
        'flex flex-col gap-4'
      )}
    >
      <div className='flex flex-col gap-2'>
        <div className='flex justify-between gap-2'>
          <CreatorPreview />
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
        <Button variant='primaryOutline' className='w-full' size='sm'>Increase Stake</Button>
        <Button variant='outlined' className='w-full' size='sm'>Unstake</Button>
      </div>
    </div>
  )
}

export default CreatorCard
