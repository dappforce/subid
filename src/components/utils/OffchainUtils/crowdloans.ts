import { RelayChain } from '../../../types/index'
import axios from 'axios'
import { getBackendUrl, sendRequest } from './utils'
import { CrowdloanInfo } from '../../identity/types'

type GetCrowdloansProps = {
  account: string
  relayChain: RelayChain
}

export const getCrowdloans = async ({
  account,
  relayChain,
}: GetCrowdloansProps) => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`crowdloans/contributions/${relayChain}/${account}`)),
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to get crowdloans'
  })
)
  

export const getCrowdloansInfoByRelayChain = async (
  relayChain: RelayChain
): Promise<CrowdloanInfo[]> => (
  sendRequest({
    request: () => axios.get(getBackendUrl(`crowdloans/${relayChain}`)),
    onFaileReturnedValue: [],
    onFailedText: `Failed to get crowdloans info by relay chain ${relayChain}`
  })
)

type GetVestingDataProps = {
  account: string
  networks: string[]
  noCache: boolean
}

export const getVestingData = async ({
  account,
  networks,
  noCache,
}: GetVestingDataProps) => (
  sendRequest({
    request: async () => {
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

      return res
    },
    onFaileReturnedValue: {},
    onFailedText: `Failed to get vesting data for account ${account}`
  })
)