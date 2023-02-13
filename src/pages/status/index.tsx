import StatusPage from '../../components/statusPage'
import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData } from '../../rtk/app/util'

getInitialPropsWithRedux(StatusPage, async ({ dispatch }) => {

  fetchData(dispatch)

  return {}
})

export default StatusPage