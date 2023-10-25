import { isEthereumAddress } from '@polkadot/util-crypto'
import {
  supportedNetworks,
  evmLikeNetworks,
} from '../rtk/features/multiChainInfo/types'
import { isDef } from '@subsocial/utils'
import { sendGetRequest } from './utils'
import { AnyAddress } from '../components/utils/index'

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
    onFailedText: `Failed to get balances by account: ${account}`
  })

  return res ? { network, info: res } : undefined
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
