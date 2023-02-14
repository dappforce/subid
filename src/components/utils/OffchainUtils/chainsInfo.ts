import axios from 'axios'
import { getBackendUrl, sendRequest } from './utils'

export const getChainsInfo = async () => (
  sendRequest({
    request: () => axios.get(getBackendUrl('/chains/properties')),
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to get chain info'
  })
)