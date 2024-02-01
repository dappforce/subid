import LinkText from '../tailwind-components/LinkText'
import PartyIcon from '@/assets/icons/party-icon.svg'
import PartyIconMobile from '@/assets/icons/party-icon-mobile.svg'
import { useResponsiveSize } from '@/components/responsive'

const NewStakingVersionSection = () => {
  const { isMobile } = useResponsiveSize()

  return (
    <div className='flex flex-col gap-[10px] relative rounded-[20px] border md:p-6 p-4 border-orange-600 bg-[#FEF9E5]'>
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
      <div className='absolute md:right-4 right-[-1rem] md:bottom-4 md:top-[auto] top-[-1rem]'>
        {isMobile ? <PartyIconMobile /> : <PartyIcon />}
      </div>
    </div>
  )
}

export default NewStakingVersionSection
