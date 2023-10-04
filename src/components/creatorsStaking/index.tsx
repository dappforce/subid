import { StakingContextWrapper } from '../staking/collators/StakingContext'
import Banner from './Banner'
import CreatorDashboard from './CreatorDashboard'
import CreatorsSection from './Creators'
import MyStakingSection from './MyStaking'

const CreatorsStaking = () => {
  return (
    <div className='flex flex-col gap-10'>
      <StakingContextWrapper network='subsocial'>
        <Banner />

        <CreatorDashboard />
        <MyStakingSection />
        
        <CreatorsSection />
      </StakingContextWrapper>
    </div>
  )
}

export default CreatorsStaking
