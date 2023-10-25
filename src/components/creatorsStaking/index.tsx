import Image from 'next/image'
import { useIsMulti } from '../providers/MyExtensionAccountsContext'
import { StakingContextWrapper } from '../staking/collators/StakingContext'
import Banner from './Banner'
import CreatorDashboard from './CreatorDashboard'
import CreatorsSection from './Creators'
import MyStakingSection from './MyStaking'
import clsx from 'clsx'
import { linkTextStyles } from './tailwind-components/LinkText'
import { useState } from 'react'
import HowToSelectAccountModal from './Creators/modals/HowToSelectAccountModal'

const MultiAccountWarning = () => {
  const [ openModal, setOpenModal ] = useState(false)

  const onButtonClick = () => {
    setOpenModal(true)
  }

  return (
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
            Switch to single account mode
          </div>
          <div className='text-base text-[#7B4511] font-normal'>
            To use Creator Staking, please select the account you would like to
            stake from.{' '}
            <span
              onClick={onButtonClick}
              className={clsx(linkTextStyles({ variant: 'primary' }))}
            >
              How do I select an account?
            </span>
          </div>
        </div>
      </div>
      <HowToSelectAccountModal
        open={openModal}
        closeModal={() => setOpenModal(false)}
      />
    </div>
  )
}

const CreatorsStaking = () => {
  const isMulti = useIsMulti()

  return (
    <div className='flex flex-col gap-10'>
      <StakingContextWrapper network='subsocial'>
        <Banner />

        {isMulti ? (
          <MultiAccountWarning />
        ) : (
          <>
            <CreatorDashboard />
            <MyStakingSection />
          </>
        )}
        <CreatorsSection />
      </StakingContextWrapper>
    </div>
  )
}

export default CreatorsStaking
