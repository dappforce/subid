import { sendGetRequest } from '../utils'

const VALIDATOR_STAKING_PATH = 'staking/validator'

export const getValidatorsListByNetwork = async (network: string) => (
  sendGetRequest({
    params: { url: `${VALIDATOR_STAKING_PATH}/list/${network}` },
    onFailReturnedValue: {},
    onFailedText: `Failed to get validators list by network ${network}`
  })
)

export const getValidatorStakingProps = async (network: string) => (
  sendGetRequest({
    params: { url: `${VALIDATOR_STAKING_PATH}/props/${network}` },
    onFailReturnedValue: [],
    onFailedText: `Failed to get validators staking props by network ${network}`
  })
)

export const getStakingReward = async (network: string, account: string) => (
  sendGetRequest({
    params: { url: `${VALIDATOR_STAKING_PATH}/reward/${network}/${account}` },
    onFailReturnedValue: [],
    onFailedText: `Failed to get validators staking rewards by network ${network}`
  })
)

export const getNominatorsInfo = async (network: string, account: string) => (
  sendGetRequest({
    params: { 
      url: `${VALIDATOR_STAKING_PATH}/nominator/info/`,
      config: {
        params: {
          network,
          account
        }
      } 
    },
    onFailReturnedValue: [],
    onFailedText: `Failed to get nominator info by network ${network}`
  })
)

export const getRewardDestination = async (network: string, account: string) => (
  sendGetRequest({
    params: { 
      url: `${VALIDATOR_STAKING_PATH}/nominator/payee/`,
      config: {
        params: {
          network,
          account
        }
      }
    },
    onFailReturnedValue: {},
    onFailedText: `Failed to get nominator reward destination by network ${network}`
  })
)

export const getController = async (network: string, account: string) => (
  sendGetRequest({
    params: { 
      url: `${VALIDATOR_STAKING_PATH}/nominator/controller/`,
      config: {
        params: {
          network,
          account
        }
      }
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to get nominator controller account by network ${network}`
  })
)

export const getStakingLedger = async (network: string, account: string) => (
  sendGetRequest({
    params: { 
      url: `${VALIDATOR_STAKING_PATH}/nominator/ledger/`,
      config: {
        params: {
          network,
          account
        }
      }
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to get nominator staking ledger by network ${network}`
  })
)

export const getNominators = async (network: string, account: string) => (
  sendGetRequest({
    params: { 
      url: `${VALIDATOR_STAKING_PATH}/nominator/nominators/`,
      config: {
        params: {
          network,
          account
        }
      }
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to get nominator staking nominators by network ${network}`
  })
)