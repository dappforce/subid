import HomePage from '../components/main/HomePage'

import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData } from '../rtk/app/util'

getInitialPropsWithRedux(HomePage, async ({ dispatch }) => {
  fetchData(dispatch)

  return {}
})

export default HomePage