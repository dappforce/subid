import InterestingAccountsPage from '../../../components/main/InterestingAccounts'

import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData, fetchDataByAccount, getInitialAccoutsData } from '../../../rtk/app/util'
import { parseAddressFromUrl } from '../../../components/utils/index'

getInitialPropsWithRedux(InterestingAccountsPage, async ({ dispatch, context }) => {
  const { address } = context.query

  const accounts = parseAddressFromUrl(address)

  fetchData(dispatch)

  const { initialAccounts, accountsLength } = await getInitialAccoutsData()

  if (accounts) {
    fetchDataByAccount(dispatch, accounts, false, true)
  }

  return {
    initialAccounts,
    accountsLength
  }
})

export default InterestingAccountsPage