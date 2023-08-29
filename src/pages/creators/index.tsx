import CreatorsStakingPage from 'src/components/main/CreatorsStakingPage'
import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchCreatorsList } from '../../rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { FETCH_CHIAN_INFO_WITH_PRICES } from 'src/rtk/app/actions'
import { fetchStakingConsts } from '../../rtk/features/creatorStaking/stakingConsts/stakingConstsHooks';

getInitialPropsWithRedux(CreatorsStakingPage, async ({ dispatch }) => {
  dispatch({ type: FETCH_CHIAN_INFO_WITH_PRICES })
  fetchCreatorsList(dispatch)
  fetchStakingConsts(dispatch)

  return { }
})

export default CreatorsStakingPage