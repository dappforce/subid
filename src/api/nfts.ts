import { sendGetRequest } from './utils'

export const getNtfsByAccount = async (account: string) => (
  sendGetRequest({
    params: { url: `${account}/nfts` },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to get nfts by account'
  })
)