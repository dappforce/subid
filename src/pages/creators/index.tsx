import CreatorsStakingPage from 'src/components/main/CreatorsStakingPage'
import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData } from 'src/rtk/app/util'

getInitialPropsWithRedux(CreatorsStakingPage, async ({ dispatch }) => {

  fetchData(dispatch)

  return { }
})

export default CreatorsStakingPage