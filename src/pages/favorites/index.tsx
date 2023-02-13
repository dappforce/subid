import { getInitialPropsWithRedux } from '../../rtk/app/nextHelpers'
import { fetchData } from '../../rtk/app/util'
import FavoriteAccountsPage from '../../components/main/FavoriteAccountsPage'

getInitialPropsWithRedux(FavoriteAccountsPage, async ({ dispatch }) => {
  fetchData(dispatch)

  return {}
})

export default FavoriteAccountsPage