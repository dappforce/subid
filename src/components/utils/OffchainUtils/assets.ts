import axios from 'axios'
import { getBackendUrl, sendRequest } from './utils'

export const getAssets = async () => ( 
  sendRequest({
    request: () => axios.get(getBackendUrl('statemine/assets')),
    onFaileReturnedValue: [],
    onFailedText: 'Failed to get assets'
  })
)

export const getAssetsBalancesByAccount = async (account: string) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`statemine/assets/${account}`)),
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to get assets balances by account'
  })
)