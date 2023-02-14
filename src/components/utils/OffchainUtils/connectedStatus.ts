import { getBackendUrl, sendRequest } from './utils'
import axios from 'axios'

export const getConnectedStatus = async (chainName: string) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`check/${chainName}`)),
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch chain status'
  })
)
