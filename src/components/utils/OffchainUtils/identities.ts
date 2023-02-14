import axios from 'axios'
import { getBackendUrl, sendRequest } from './utils'

export const getAccountIdentities = async (accounts: string[]) => (
  sendRequest({
    request: () => axios.get(getBackendUrl('identities'), {
      params: {
        accounts,
      },
    }),
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to get identities info'
  })
)
