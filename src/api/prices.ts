import { sendGetRequest } from './utils'

export const getTokenPrice = async (chains: string) => (
  sendGetRequest({
    params: { url: `prices?ids=${chains}` },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to get token price'
  })
)