import { getBackendUrl } from './utils'
import axios from 'axios'

export const getValidatorsListByNetwork = async (network: string) => {
  try {
    const res = await axios.get(
      getBackendUrl(`staking/validator/list/${network}`)
    )
    if (res.status !== 200) {
      console.warn(`Failed to get validators list by network ${network}`)
    }
    return res.data
  } catch (err) {
    console.error(`Failed to get validators list by network ${network}`, err)
    return {}
  }
}

export const getValidatorStakingProps = async (network: string) => {
  try {
    const res = await axios.get(
      getBackendUrl(`staking/validator/props/${network}`)
    )
    if (res.status !== 200) {
      console.warn(`Failed to get validators staking props by network ${network}`)
    }
    return res.data
  } catch (err) {
    console.error(`Failed to get validators staking props by network ${network}`, err)
    return []
  }
}

export const getStakingReward = async (network: string, account: string) => {
  try {
    const res = await axios.get(
      getBackendUrl(`staking/validator/reward/${network}/${account}`)
    )
    if (res.status !== 200) {
      console.warn(`Failed to get validators staking info by network ${network}`)
    }
    return res.data
  } catch (err) {
    console.error(`Failed to get validators staking info by network ${network}`, err)
    return []
  }
}

export const getNominatorsInfo = async (network: string, account: string) => {
  try {
    const res = await axios.get(
      getBackendUrl('staking/validator/nominator/info/'),
      {
        params: {
          network,
          account
        }
      }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get nominator info by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get nominator info by network ${network}`, err)
    return []
  }
}

export const getRewardDestination = async (network: string, account: string) => {
  try {
    const res = await axios.get(
      getBackendUrl('staking/validator/nominator/payee/'),
      {
        params: {
          network,
          account
        }
      }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get nominator reward destination by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get nominator reward destination by network ${network}`, err)
    return {}
  }
}

export const getController = async (network: string, account: string) => {
  try {
    const res = await axios.get(
      getBackendUrl('staking/validator/nominator/controller/'),
      {
        params: {
          network,
          account
        }
      }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get nominator controller account by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get nominator controller account by network ${network}`, err)
    return
  }
}

export const getStakingLedger = async (network: string, account: string) => {
  try {
    const res = await axios.get(
      getBackendUrl('staking/validator/nominator/ledger/'),
      {
        params: {
          network,
          account
        }
      }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get nominator staking ledger by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get nominator staking ledger by network ${network}`, err)
    return
  }
}

export const getNominators = async (network: string, account: string) => {
  try {
    const res = await axios.get(
      getBackendUrl('staking/validator/nominator/nominators/'),
      {
        params: {
          network,
          account
        }
      }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get nominator staking nominators by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get nominator staking ledger by network ${network}`, err)
    return
  }
}