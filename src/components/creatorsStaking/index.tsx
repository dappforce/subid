import Banner from './Banner'
import CreatorsSection from './Creators'
import MyStakingSection from './MyStaking'

const CreatorsStakingWrapper = () => {
  return (
    <div className='flex flex-col gap-10'>
      <Banner />
      <MyStakingSection />
      <CreatorsSection />
    </div>
  )
}

export default CreatorsStakingWrapper