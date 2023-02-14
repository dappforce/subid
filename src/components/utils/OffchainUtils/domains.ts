import axios from 'axios'
import { getBackendUrl, sendRequest } from './utils'

export const getOwnerByDomain = async (domain: string) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`domains/${domain}`)),
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to get address by domain'
  })
)