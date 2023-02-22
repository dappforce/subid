import { sendGetRequest } from '../utils'

const COLLATOR_STAKING_PATH = 'staking/collator'

export const getCandidatesListByNetwork = async (network: string) => (
  sendGetRequest({
    params: { url: `${COLLATOR_STAKING_PATH}/candidates/list/${network}` },
    onFaileReturnedValue: [],
    onFailedText: `Failed to get candidates list by network ${network}`
  })
)

export const getStakingRoundByNetwork = async (network: string) => (
  sendGetRequest({
    params: { url: `${COLLATOR_STAKING_PATH}/round/${network}` },
    onFaileReturnedValue: [],
    onFailedText: `Failed to get staking round by network ${network}`
  })
)


export const getStakingConstsByNetwork = async (network: string) => (
  sendGetRequest({
    params: { url: `${COLLATOR_STAKING_PATH}/consts/${network}` },
    onFaileReturnedValue: [],
    onFailedText: `Failed to get staking consts by network ${network}`
  })
)

export const getSelectedCandidatesByNetwork = async (network: string) => (
  sendGetRequest({
    params: { url: `${COLLATOR_STAKING_PATH}/selected/${network}` },
    onFaileReturnedValue: [],
    onFailedText: `Failed to get selected candidates by network ${network}`
  })
)

export const getCandidatesInfoByNetwork = async (
  network: string,
  accounts: string[]
) => (
  sendGetRequest({
    params: {
      url:  `${COLLATOR_STAKING_PATH}/candidates/info`,
      config: {
        params: {
          accounts,
          network,
        },
      }
    },
    onFaileReturnedValue: [],
    onFailedText: `Failed to get candidates info by network ${network}`
  })
)

export const getDelegatorsStateByNetwork = async (
  network: string,
  accounts: string[]
) => (
  sendGetRequest({
    params: {
      url: `${COLLATOR_STAKING_PATH}/delegators/state`,
      config: {
        params: {
          accounts,
          network,
        },
      }
    },
    onFaileReturnedValue: [],
    onFailedText: `Failed to get delegator state by network ${network}`
  })
)

export const getScheduledRequestsByNetwork = async (
  network: string,
  accounts: string[]
) => (
  sendGetRequest({
    params: {
      url: `${COLLATOR_STAKING_PATH}/scheduled/requests`,
      config: {
        params: {
          accounts,
          network,
        },
      }
    },
    onFaileReturnedValue: [],
    onFailedText: `Failed to get scheduled requests by network ${network}`
  })
)
