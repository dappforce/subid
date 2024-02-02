import CreatorsStakingPage from 'src/components/main/CreatorStakingPage'
import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchCreatorsList } from '../../rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { FETCH_CHIAN_INFO_WITH_PRICES } from 'src/rtk/app/actions'
import { fetchStakingConsts } from '../../rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'

getInitialPropsWithRedux(CreatorsStakingPage, async ({ dispatch }) => {
  dispatch({ type: FETCH_CHIAN_INFO_WITH_PRICES })
  fetchCreatorsList(dispatch)
  fetchStakingConsts(dispatch)

  return {
    head: {
      title: 'Join The Creator Economy On Subsocial',
      desc: 'Earn rewards when you post content or engage with others in Subsocial\'s Content Staking system. Lock some SUB to get started today!',
      image: '/images/creator-staking/meta-bg.jpg',
      forceTitle: true,
    },
  }
})

export default CreatorsStakingPage
