import Image from 'next/image'
import { useIsMulti } from '../providers/MyExtensionAccountsContext'
import { StakingContextWrapper } from '../staking/collators/StakingContext'
import Banner from './Banner'
import CreatorDashboard from './CreatorDashboard'
import CreatorsSection from './Creators'
import MyStakingSection from './MyStaking'
import clsx from 'clsx'

const CreatorsStaking = () => {
  const isMulti = useIsMulti()

  return (
    <div className='flex flex-col gap-10'>
      <StakingContextWrapper network='subsocial'>
        <Banner />

        {isMulti ? (
          <div
            className={clsx(
              'flex items-center justify-between',
              'md:flex-row flex-col gap-6 bg-[#FEFCE5]',
              'p-6 rounded-[20px]'
            )}
          >
            <div className='flex items-start gap-6'>
              <Image
                src='/images/creator-staking/warning.svg'
                alt=''
                width={24}
                height={24}
              />
              <div>
                <div className='text-xl text-[#7B4511] font-semibold mb-4'>
                  Please choose an account
                </div>
                <div className='text-base text-[#7B4511] font-normal'>
                  To manage your Creator Staking, select one of your accounts
                  from the dropdown
                </div>
              </div>
            </div>
            <Image
              src={'/images/creator-staking/choose-account.png'}
              alt=''
              height={240}
              width={315}
            />
          </div>
        ) : (
          <>
            <CreatorDashboard />
            <MyStakingSection />
            <CreatorsSection />
          </>
        )}
      </StakingContextWrapper>
    </div>
  )
}

export default CreatorsStaking
