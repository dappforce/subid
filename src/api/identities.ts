import { sendGetRequest } from './utils'

export const getAccountIdentities = async (accounts: string[]) => (
  sendGetRequest({
    params: {
      url: 'identities',
      config: {
        params: {
          accounts,
        },
      }
    },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to get identities info'
  })
)
