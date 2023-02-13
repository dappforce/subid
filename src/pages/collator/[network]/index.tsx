import CollatorStakingPage from '../../../components/main/CollatorStakingPage'
import { getInitialPropsWithRedux } from '../../../rtk/app/nextHelpers'
// import { fetchData } from '../../../rtk/app/util'
import { selectedCandidatesActions } from '../../../rtk/features/stakingCandidates/selectedCandidates/selectedCandidatesSlice'
import { candidatesListActions } from '../../../rtk/features/stakingCandidates/stakingCandidatesList/stakingCandidatesListSlice'
import { chainInfoActions } from '../../../rtk/features/multiChainInfo/multiChainInfoSlice'

getInitialPropsWithRedux(CollatorStakingPage, async ({ dispatch, context }) => {
  const { network } = context.query

  // fetchData(dispatch)

  dispatch(candidatesListActions.fetchCandidatesList(network as string))
  dispatch(selectedCandidatesActions.fetchSelectedCandidates(network as string))
  dispatch(chainInfoActions.fetchStakingConsts(network as string))


  return { network: network as string }
})

export default CollatorStakingPage