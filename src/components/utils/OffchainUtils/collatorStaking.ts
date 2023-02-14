import axios from 'axios'
import { getBackendUrl, sendRequest } from './utils'

export const getCandidatesListByNetwork = async (network: string) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`staking/collator/candidates/list/${network}`)),
    onFaileReturnedValue: [],
    onFailedText: `Failed to get candidates list by network ${network}`
  })
)

export const getStakingRoundByNetwork = async (network: string) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`staking/collator/round/${network}`)),
    onFaileReturnedValue: [],
    onFailedText: `Failed to get staking round by network ${network}`
  })
)


export const getStakingConstsByNetwork = async (network: string) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`staking/collator/consts/${network}`)),
    onFaileReturnedValue: [],
    onFailedText: `Failed to get staking consts by network ${network}`
  })
)

export const getSelectedCandidatesByNetwork = async (network: string) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`staking/collator/selected/${network}`)),
    onFaileReturnedValue: [],
    onFailedText: `Failed to get selected candidates by network ${network}`
  })
)

export const getCandidatesInfoByNetwork = async (
  network: string,
  accounts: string[]
) => (
  sendRequest({
    request: () => axios.get(
      getBackendUrl('staking/collator/candidates/info'),
      {
        params: {
          accounts,
          network,
        },
      }
    ),
    onFaileReturnedValue: [],
    onFailedText: `Failed to get candidates info by network ${network}`
  })
)

export const getDelegatorsStateByNetwork = async (
  network: string,
  accounts: string[]
) => (
  sendRequest({
    request: () => axios.get(
      getBackendUrl('staking/collator/delegators/state'),
      {
        params: {
          accounts,
          network,
        },
      }
    ),
    onFaileReturnedValue: [],
    onFailedText: `Failed to get delegator state by network ${network}`
  })
)

export const getScheduledRequestsByNetwork = async (
  network: string,
  accounts: string[]
) => (
  sendRequest({
    request: () => axios.get(
      getBackendUrl('staking/collator/scheduled/requests'),
      {
        params: {
          accounts,
          network,
        },
      }
    ),
    onFaileReturnedValue: [],
    onFailedText: `Failed to get scheduled requests by network ${network}`
  })
)
