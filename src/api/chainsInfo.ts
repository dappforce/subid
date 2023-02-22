import { sendGetRequest } from './utils'

export const getChainsInfo = async () => (
  sendGetRequest({
    params: { url: '/chains/properties' },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to get chain info'
  })
)