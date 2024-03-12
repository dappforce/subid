import { redirect } from 'next/navigation'

const CreatorsStakingPage = () => {
  return <></>
}

export const getServerSideProps = () => {
  redirect('https://grillapp.net/c/staking')
}

export default CreatorsStakingPage
