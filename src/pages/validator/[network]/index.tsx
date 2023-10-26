import { getInitialPropsWithRedux } from '../../../rtk/app/nextHelpers'
import ValidatorsStakingPage from 'src/components/main/ValidatorsStakingPage'
import { fetchData } from '../../../rtk/app/util'

getInitialPropsWithRedux(
  ValidatorsStakingPage,
  async ({ dispatch, context }) => {
    const { network } = context.query

    fetchData(dispatch)

    return {
      network: network as string,
      head: {
        title: 'Validators Staking',
      },
    }
  }
)

export default ValidatorsStakingPage
