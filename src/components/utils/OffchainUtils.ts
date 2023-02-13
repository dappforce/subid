import { isDef } from '@subsocial/utils'
import axios from 'axios'
import { backendUrl } from 'src/config/env'
import { RelayChain } from '../../types'
import { AccountInfoItem, CrowdloanInfo } from '../identity/types'
import { isEthereumAddress } from '@polkadot/util-crypto'
import {
  supportedNetworks,
  evmLikeNetworks,
} from '../../rtk/features/multiChainInfo/types'
import { AnyAddress } from '.'
import { AccountCardType } from '../interesting-accounts/types'
import { VestingRecord } from 'src/rtk/features/vesting/vestingSlice'
import { FeeData } from 'src/rtk/features/fees/feesSlice'

export function getBackendUrl (subUrl: string): string {
  return `${backendUrl}/api/v1/${subUrl}`
}

type BalanceByNetworkProps = {
  account: AnyAddress
  network: string
}

export const getAccountBalancesByNetwork = async ({
  account,
  network,
}: BalanceByNetworkProps) => {
  try {
    const { data: info, status } = await axios.get(
      getBackendUrl(`${account}/balances/${network}`)
    )
    if (status !== 200) {
      console.warn(`Failed to get balances by account: ${account}`)
      return undefined
    }
    return { network, info } as AccountInfoItem
  } catch (err) {
    console.error(
      `Failed to get balances from ${network} by account: ${account}`,
      err
    )
    return undefined
  }
}

export const getAccountInfo = async (account: string) => {
  const networks = isEthereumAddress(account)
    ? evmLikeNetworks
    : supportedNetworks

  const promises = networks.map(async (network) =>
    getAccountBalancesByNetwork({ account, network })
  )

  const balances = await Promise.all(promises)

  return balances.filter(isDef)
}

export const getChainsInfo = async () => {
  try {
    const res = await axios.get(getBackendUrl('/chains/properties'))
    if (res.status !== 200) {
      console.warn('Failed to get chain info')
    }

    return res.data
  } catch (err) {
    console.error('Failed to get chain info', err)
    return undefined
  }
}

export const getAccountIdentities = async (accounts: string[]) => {
  try {
    const res = await axios.get(getBackendUrl('identities'), {
      params: {
        accounts,
      },
    })
    if (res.status !== 200) {
      console.warn('Failed to get identities info')
    }

    return res.data
  } catch (err) {
    console.error('Failed to get identities info', err)
    return undefined
  }
}

export const getTokenPrice = async (chains: string) => {
  try {
    const res = await axios.get(
      getBackendUrl(`prices?ids=${chains}`)
    )
    if (res.status !== 200) {
      console.warn('Failed to get token price')
    }

    return res.data
  } catch (err) {
    console.error('Failed to get token price', err)
    return undefined
  }
}

type GetCrowdloansProps = {
  account: string
  relayChain: RelayChain
}

export const getCrowdloans = async ({
  account,
  relayChain,
}: GetCrowdloansProps) => {
  try {
    const res = await axios.get(
      getBackendUrl(`crowdloans/contributions/${relayChain}/${account}`)
    )

    if (res.status !== 200) {
      console.warn('Failed to get crowdloans')
    }

    return res.data
  } catch (err) {
    console.error('Failed to get crowdloans', err)
    return undefined
  }
}

export const getCrowdloansInfoByRelayChain = async (
  relayChain: RelayChain
): Promise<CrowdloanInfo[]> => {
  try {
    const res = await axios.get(getBackendUrl(`crowdloans/${relayChain}`))

    if (res.status !== 200) {
      console.warn('Failed to get crowdloans info by relay chain', relayChain)
    }

    return (res.data || []).filter(isDef)
  } catch (err) {
    console.error(
      'Failed to get crowdloans info by relay chain',
      relayChain,
      err
    )
    return []
  }
}

const getAccountsApiUrl = (suburl: string) =>
  `${getBackendUrl('accounts')}/${suburl}`

export const getValidatorsByChain = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  try {
    const res = await axios.get(getAccountsApiUrl(`${relayChain}/validators`), {
      params: { offset, limit },
    })
    if (res.status !== 200) {
      console.warn('Failed to get chain info')
    }

    return (res.data || []).filter(isDef)
  } catch (err) {
    console.error('Failed to get validators info', err)
    return []
  }
}

export const getAllInterestingAccounts = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  try {
    const res = await axios.get(getAccountsApiUrl(`all/${relayChain}`), {
      params: { offset, limit },
    })
    if (res.status !== 200) {
      console.warn('Failed to get all interesting accounts')
    }

    return (res.data || []).filter(isDef)
  } catch (err) {
    console.error('Failed to get all interesting accounts', err)
    return []
  }
}

export const getAllAccountsLength = async (): Promise<number> => {
  try {
    const res = await axios.get(getAccountsApiUrl('length'))
    if (res.status !== 200) {
      console.warn('Failed to get all accounts length')
    }

    return res.data || 0
  } catch (err) {
    console.error('Failed to get all accounts length', err)
    return 0
  }
}

export const getAccountsOverviewItems = async (): Promise<
  AccountCardType[]
> => {
  try {
    const res = await axios.get(getAccountsApiUrl('overview'))
    if (res.status !== 200) {
      console.warn('Failed to get overview items for accounts')
    }

    return (res.data || []).filter(isDef)
  } catch (err) {
    console.error('Failed to get overview items for accounts', err)
    return []
  }
}

export const getCouncilMembersByChain = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  try {
    const res = await axios.get(getAccountsApiUrl(`${relayChain}/council`), {
      params: { offset, limit },
    })
    if (res.status !== 200) {
      console.warn('Failed to get validators info')
    }

    return (res.data || []).filter(isDef)
  } catch (err) {
    console.error('Failed to get validators info', err)
    return []
  }
}

export const getCrowdloanContributorsByChain = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  try {
    const res = await axios.get(
      getAccountsApiUrl(`${relayChain}/contributors`),
      { params: { offset, limit } }
    )
    if (res.status !== 200) {
      console.warn('Failed to get validators info')
    }

    return (res.data || []).filter(isDef)
  } catch (err) {
    console.error('Failed to get validators info', err)
    return []
  }
}

export const getNtfsByAccount = async (account: string) => {
  try {
    const res = await axios.get(getBackendUrl(`${account}/nfts`))
    if (res.status !== 200) {
      console.warn('Failed to get nfts by account', account)
    }

    return res.data
  } catch (err) {
    console.error('Failed to get nfts by account', err)
    return undefined
  }
}

export const getAssets = async () => {
  try {
    const res = await axios.get(getBackendUrl('statemine/assets'))
    if (res.status !== 200) {
      console.warn('Failed to get assets')
    }

    return res.data
  } catch (err) {
    console.error('Failed to get assets', err)
    return []
  }
}

export const getAssetsBalancesByAccount = async (account: string) => {
  try {
    const res = await axios.get(getBackendUrl(`statemine/assets/${account}`))
    if (res.status !== 200) {
      console.warn('Failed to get assets balances by account')
    }

    return res.data
  } catch (err) {
    console.error('Failed to get assets balances by account', err)
    return undefined
  }
}

export const getConnectedStatus = async (chainName: string) => {
  try {
    const res = await axios.get(getBackendUrl(`check/${chainName}`))
    if (res.status !== 200) {
      console.warn('Failed to fetch chain status')
    }

    return res.data
  } catch (err) {
    console.error('Failed to fetch chain status', err)
    return undefined
  }
}

export const getOwnerByDomain = async (domain: string) => {
  try {
    const res = await axios.get(getBackendUrl(`domains/${domain}`))
    if (res.status !== 200) {
      console.warn('Failed to get address by domain')
    }

    return res.data?.owner as string | undefined
  } catch (err) {
    console.error('Failed to get address by domain', err)
    return undefined
  }
}

export const getCandidatesListByNetwork = async (network: string) => {
  try {
    const res = await axios.get(
      getBackendUrl(`staking/collator/candidates/list/${network}`)
    )
    if (res.status !== 200) {
      console.warn(`Failed to get candidates list by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get candidates list by network ${network}`, err)
    return []
  }
}

export const getCandidatesInfoByNetwork = async (
  network: string,
  accounts: string[]
) => {
  try {
    const res = await axios.get(
      getBackendUrl('staking/collator/candidates/info'),
      {
        params: {
          accounts,
          network,
        },
      }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get candidates info by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get candidates info by network ${network}`, err)
    return []
  }
}

export const getSelectedCandidatesByNetwork = async (network: string) => {
  try {
    const res = await axios.get(
      getBackendUrl(`staking/collator/selected/${network}`)
    )
    if (res.status !== 200) {
      console.warn(`Failed to get selected candidates by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(
      `Failed to get selected candidates by network ${network}`,
      err
    )
    return []
  }
}

export const getDelegatorsStateByNetwork = async (
  network: string,
  accounts: string[]
) => {
  try {
    const res = await axios.get(
      getBackendUrl('staking/collator/delegators/state'),
      {
        params: {
          accounts,
          network,
        },
      }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get delegator state by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get delegator state by network ${network}`, err)
    return []
  }
}

export const getScheduledRequestsByNetwork = async (
  network: string,
  accounts: string[]
) => {
  try {
    const res = await axios.get(
      getBackendUrl('staking/collator/scheduled/requests'),
      {
        params: {
          accounts,
          network,
        },
      }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get scheduled requests by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get scheduled requests by network ${network}`, err)
    return []
  }
}

export const getStakingRoundByNetwork = async (network: string) => {
  try {
    const res = await axios.get(
      getBackendUrl(`staking/collator/round/${network}`)
    )
    if (res.status !== 200) {
      console.warn(`Failed to get staking round by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get staking round by network ${network}`, err)
    return []
  }
}

export const getStakingConstsByNetwork = async (network: string) => {
  try {
    const res = await axios.get(
      getBackendUrl(`staking/collator/consts/${network}`)
    )
    if (res.status !== 200) {
      console.warn(`Failed to get staking consts by network ${network}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get staking consts by network ${network}`, err)
    return []
  }
}

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

type GetVestingDataProps = {
  account: string
  networks: string[]
  noCache: boolean
}

export const getVestingData = async ({
  account,
  networks,
  noCache,
}: GetVestingDataProps) => {
  try {
    const randomToDisableCache = Math.floor(Math.random() * 1000)
    const res = await axios.get(
      getBackendUrl(`crowdloans/vesting/${account}`),
      {
        params: {
          network: networks,
          noCache,
          t: randomToDisableCache,
        },
      }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get vesting data for account ${account}`)
    }

    return res.data as VestingRecord
  } catch (err) {
    console.error(`Failed to get vesting data for account ${account}`, err)
    return {}
  }
}

export async function getTransferFee (token: string, source: string, dest?: string): Promise<FeeData> {
  try {
    const res = await axios.get(
      getBackendUrl('fees/transfer'),
      { params: { token, from: source, to: dest } }
    )
    if (res.status !== 200) {
      console.warn(`Failed to get transfer token ${token} fee from network ${source} ${dest ? 'to network' + dest : ''}`)
    }

    return res.data
  } catch (err) {
    console.error(`Failed to get transfer token ${token} fee from network ${source} ${dest ? 'to network' + dest : ''}`, err)
    return { amount: '0', token: '' }
  }
}
