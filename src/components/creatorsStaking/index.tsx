import Banner from './Banner'
import CreatorsSection from './Creators'
import MyStakingSection from './MyStaking'

const CreatorsStaking = () => {
  return (
    <div className='flex flex-col gap-10'>
      <Banner />
      <MyStakingSection />
      <CreatorsSection />
    </div>
  )
}

export default CreatorsStaking