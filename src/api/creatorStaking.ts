import { sendGetRequest } from './utils'

export const getCreatorsList = async () =>
  sendGetRequest({
    params: { url: 'staking/creator/list' },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to fetch creators list',
  })

export const getGeneralEraInfo = async () =>
  sendGetRequest({
    params: { url: 'staking/creator/era/info' },
    onFailReturnedValue: undefined,
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
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to fetch creators spaces',
  })

export const getEraStakesBySpaceIds = async (ids: string[], era: string) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/era/stake',
      config: {
        params: {
          ids: ids.join(','),
          era,
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to fetch era stakes by space ids: ${ids.join(',')}`,
  })

export const getBackerInfoBySpaces = async (ids: string[], account: string) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/backer/info',
      config: {
        params: {
          ids: ids.join(','),
          account,
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to fetch backer info by spaces: ${ids.join(',')}`,
  })

export const getBackerLedger = async (account: string) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/backer/ledger',
      config: {
        params: {
          account,
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to fetch backer ledger: ${account}`,
  })

export const getStakingConsts = async () =>
  sendGetRequest({
    params: {
      url: 'staking/creator/consts',
    },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to fetch staking consts',
  })

export const getBackerRewards = async (account: string, spaceIds: string[]) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/backer/rewards',
      config: {
        params: {
          account,
          ids: spaceIds.join(','),
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to fetch backer rewards',
  })

export const getCreatorRewards = async (spaceId: string) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/rewards',
      config: {
        params: {
          id: spaceId,
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to fetch creator rewards by space id: ${spaceId}`,
  })
