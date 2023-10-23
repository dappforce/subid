import { sendGetRequest } from './utils'

export const getOwnerByDomain = async (domain: string) => (
  sendGetRequest({
    params: { url: `domains/${domain}` },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to get address by domain'
  })
)