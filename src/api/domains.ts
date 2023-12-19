import { sendGetRequest } from './utils'

export const getOwnerByDomain = async (domain: string) => (
  sendGetRequest({
    params: { url: `domains/${domain}` },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to get address by domain'
  })
)

export const getDomainBySpaceId = async (spaceId: string) => (
  sendGetRequest({
    params: { url: `domain/${spaceId}` },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to get domain by space id'
  })
)