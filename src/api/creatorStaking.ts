import { sendGetRequest } from './utils'

export const getCreatorsList = async () =>
  sendGetRequest({
    params: { url: 'staking/creator/list' },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch creators list',
  })

export const getGeneralEraInfo = async () =>
  sendGetRequest({
    params: { url: 'staking/creator/era/info' },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch general era info',
  })

export const getCreatorsSpaces = async (ids: string[]) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/spaces/info',
      config: {
        params: {
          ids,
        },
      },
    },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch general era info',
  })

export const getEraStakesBySpaceIds = async (ids: string[], era: string) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/era/stake',
      config: {
        params: {
          ids: ids.join(','),
          era
        },
      },
    },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch general era info',
  })
