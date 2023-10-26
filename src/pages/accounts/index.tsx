import InterestingAccountsPage from '../../components/main/InterestingAccounts'

import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData } from 'src/rtk/app/util'
import { getInitialAccoutsData } from '../../rtk/app/util'

getInitialPropsWithRedux(InterestingAccountsPage, async ({ dispatch }) => {
  fetchData(dispatch)

  const { initialAccounts, accountsLength } = await getInitialAccoutsData()

  return {
    initialAccounts,
    accountsLength,
    head: {
      title: 'Interesting Accounts',
    }
  }
})

export default InterestingAccountsPage