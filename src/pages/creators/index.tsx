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
      title: 'Support Favorite Creators And Receive Tokens!',
      desc: 'Stake SUB towards the best creators of content, applications, and communities. Both you and the creator will receive more tokens, and help grow the network.',
      image: '/images/creator-staking/meta-bg.jpg',
      forceTitle: true,
    },
    spaceId: undefined,
  }
})

export default CreatorsStakingPage
