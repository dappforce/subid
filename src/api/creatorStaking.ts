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
          era,
        },
      },
    },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch general era info',
  })

export const getStakerInfoBySpaces = async (ids: string[], account: string) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/staker/info',
      config: {
        params: {
          ids: ids.join(','),
          account,
        },
      },
    },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch staker info by spaces',
  })

export const getStakerLedger = async (account: string) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/staker/ledger',
      config: {
        params: {
          account,
        },
      },
    },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch staker ledger',
  })

export const getStakingConsts = async () =>
  sendGetRequest({
    params: {
      url: 'staking/creator/consts',
    },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch staking consts',
  })

export const getStakerRewards = async (account: string, spaceIds: string[]) =>
  sendGetRequest({
    params: {
      url: 'staking/creator/staker/rewards',
      config: {
        params: {
          account,
          ids: spaceIds.join(','),
        },
      },
    },
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to fetch staker rewards',
  })
