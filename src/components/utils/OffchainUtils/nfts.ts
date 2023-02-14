import axios from 'axios'
import { getBackendUrl, sendRequest } from './utils'

export const getNtfsByAccount = async (account: string) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`${account}/nfts`)),
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to get nfts by account'
  })
)