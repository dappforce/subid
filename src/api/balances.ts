import { isEthereumAddress } from '@polkadot/util-crypto'
import { evmLikeNetworks, supportedNetworks, } from '../rtk/features/multiChainInfo/types'
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
    timeout: 2000,
  })

  return res ? { network, info: res } : undefined
}

// const getAccountBalancesRequest = async (account: string, networks: string[]) => {
//   return sendGetRequest({
//     params: {
//       url: 'balances',
//       config: {
//         params: {
//           networks,
//           account,
//         },
//       },
//     },
//     onFailReturnedValue: undefined,
//     onFailedText: 'Failed to get balances',
//   })
// }

export const getAccountBalances = async (account: string) => {
  const networks = isEthereumAddress(account)
    ? [ ...evmLikeNetworks ]
    : [ ...supportedNetworks ]

  const promises = networks.map(async (network) => getAccountBalancesByNetwork({
      account,
      network,
    }))

  const balancesRes = await Promise.allSettled(promises)

  return balancesRes
      .map(balance =>
          balance.status === 'fulfilled' ? balance.value : undefined)
      .filter(isDef)

  // const middleIndex = Math.ceil(networks.length / 2)
  //
  // const firstHalf = networks.splice(0, middleIndex)
  // const secondHalf = networks.splice(-middleIndex)
  //
  // const promise = [ firstHalf, secondHalf ].map(async (networksChunk) =>
  //   getAccountBalancesRequest(account, networksChunk)
  // )
  //
  // const res = await Promise.allSettled(promise)
  // return res.filter(isDef).flat()
}
