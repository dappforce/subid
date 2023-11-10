import CrowdloanPage from '../../../../components/main/CrowdloanPage'

import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData, fetchDataByAccount } from '../../../../rtk/app/util'
import { parseAddressFromUrl } from '../../../../components/utils/index'
import { FETCH_DOTSAMA_CROWDLOAN_INFO } from '@/rtk/app/actions'
import { relayChains } from '@/components/table/utils'

getInitialPropsWithRedux(CrowdloanPage, async ({ dispatch, context }) => {
  const { address } = context.query

  const accounts = parseAddressFromUrl(address)

  fetchData(dispatch)
  dispatch({
    type: FETCH_DOTSAMA_CROWDLOAN_INFO,
    payload: relayChains,
  })

  if (accounts) {
    await fetchDataByAccount(dispatch, accounts, false, true)
  }

  return {}
})

export default CrowdloanPage