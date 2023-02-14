import { getBackendUrl, sendRequest } from './utils'
import axios from 'axios'

export const getTokenPrice = async (chains: string) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`prices?ids=${chains}`)),
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to get token price'
  })
)