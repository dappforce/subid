import LinkText from '../tailwind-components/LinkText'
import PartyIcon from '@/assets/icons/party-icon.svg'

const NewStakingVersionSection = () => {
  return (
    <div className='flex flex-col gap-[10px] relative rounded-[20px] border p-6 border-orange-600 bg-[#FEF9E5]'>
      <div className='text-2xl font-semibold leading-[26px] text-slate-900'>
        We&apos;ve launched a new version of staking
      </div>
      <div>
        <span className='text-gray-500 font-normal text-lg'>
          Say goodbye to lazy rewards.
        </span>{' '}
        <LinkText
          variant={'primary'}
          href={'https://subsocial.network/why-active-staking'}
          target='_blank'
        >
          Why?
        </LinkText>
      </div>
      <PartyIcon className='absolute right-4 bottom-4' />
    </div>
  )
}

export default NewStakingVersionSection
