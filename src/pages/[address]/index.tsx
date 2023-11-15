import HomePage from '../../components/main/HomePage'

import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData, fetchDataByAccount } from '../../rtk/app/util'
import { parseAddressFromUrl } from '../../components/utils/index'
import { fetchIdentities } from '@/rtk/features/identities/identitiesHooks'

getInitialPropsWithRedux(HomePage, async ({ dispatch, context }) => {
  const { address } = context.query

  const accounts = parseAddressFromUrl(address)

  fetchData(dispatch)

  if (accounts) {
    await fetchDataByAccount(dispatch, accounts, false, true)

    if (accounts.length === 1) {
      fetchIdentities(dispatch, [ accounts[0] ], true)
    }
  }

  return {}
})

export default HomePage
