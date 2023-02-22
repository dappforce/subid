import { sendGetRequest } from './utils'

export const getConnectedStatus = async (chainName: string) => (
  sendGetRequest({
    params: { url: `check/${chainName}` },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch chain status'
  })
)
