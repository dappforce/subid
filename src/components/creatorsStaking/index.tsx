import Image from 'next/image'
import { useIsMulti } from '../providers/MyExtensionAccountsContext'
import { StakingContextWrapper } from '../staking/collators/StakingContext'
import clsx from 'clsx'
import { linkTextStyles } from './tailwind-components/LinkText'
import { useState } from 'react'
import HowToSelectAccountModal from './Creators/modals/HowToSelectAccountModal'
import Banner from './Banner'
import NewStakingVersionSection from './utils/NewStakingVersionSection'
import ClaimSection from './ClaimSections'
import UnstakingSection from './UnstakingSection/index'
import StakingInfoBanner from './utils/StakingInfoBanner'

const MultiAccountWarning = () => {
  const [openModal, setOpenModal] = useState(false)

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

type CreatorsStakingProps = {
  defaultSpaceId?: string
}

const CreatorsStaking = (_props: CreatorsStakingProps) => {
  const isMulti = useIsMulti()

  return (
    <div className='flex flex-col gap-6'>
      <StakingContextWrapper network='subsocial'>
        <Banner />
        <div className='flex flex-col gap-6 mx-4'>
          {isMulti ? (
            <MultiAccountWarning />
          ) : (
            <>
              <ClaimSection />
              <StakingInfoBanner />
              <UnstakingSection />
            </>
          )}
        </div>
      </StakingContextWrapper>
    </div>
  )
}

export default CreatorsStaking
