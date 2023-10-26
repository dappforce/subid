import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData, fetchDataByAccount } from '../../../rtk/app/util'
import FavoriteAccountsPage from '../../../components/main/FavoriteAccountsPage'
import { parseAddressFromUrl } from '../../../components/utils/index'

getInitialPropsWithRedux(
  FavoriteAccountsPage,
  async ({ dispatch, context }) => {
    const { address } = context.query

    const accounts = parseAddressFromUrl(address)

    fetchData(dispatch)

    if (accounts) {
      await fetchDataByAccount(dispatch, accounts, false, true)
    }

    return {
      head: {
        title: 'Favorite Accounts',
      },
    }
  }
)

export default FavoriteAccountsPage
