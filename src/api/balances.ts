import { isEthereumAddress } from '@polkadot/util-crypto'
import {
  supportedNetworks,
  evmLikeNetworks,
} from '../rtk/features/multiChainInfo/types'
import { sendGetRequest } from './utils'
import { AnyAddress } from '../components/utils/index'
import { isDef } from '@subsocial/utils'

type BalanceByNetworkProps = {
  account: AnyAddress
  network: string
}

export const getAccountBalancesByNetwork = async ({
  account,
  network,
}: BalanceByNetworkProps) => {
  const res = await sendGetRequest({
    params: { url: `${account}/balances/${network}` },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to get balances by account: ${account}`,
  })

  return res ? { network, info: res } : undefined
}

const getAccountBalancesRequest = async (account: string, networks: string[]) => {
  return sendGetRequest({
    params: {
      url: 'balances',
      config: {
        params: {
          networks,
          account,
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to get balances',
  })
}

export const getAccountBalances = async (account: string) => {
  const networks = isEthereumAddress(account)
    ? [ ...evmLikeNetworks ]
    : [ ...supportedNetworks ]

  const middleIndex = Math.ceil(networks.length / 2)

  const firstHalf = networks.splice(0, middleIndex)
  const secondHalf = networks.splice(-middleIndex)

  const promise = [ firstHalf, secondHalf ].map(async (networksChunk) =>
    getAccountBalancesRequest(account, networksChunk)
  )

  const res = await Promise.all(promise)

  return res.filter(isDef).flat()
}
