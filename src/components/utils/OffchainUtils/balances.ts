import { AnyAddress } from '../index'
import axios from 'axios'
import { isEthereumAddress } from '@polkadot/util-crypto'
import {
  supportedNetworks,
  evmLikeNetworks,
} from '../../../rtk/features/multiChainInfo/types'
import { isDef } from '@subsocial/utils'
import { sendRequest, getBackendUrl } from './utils'

type BalanceByNetworkProps = {
  account: AnyAddress
  network: string
}

export const getAccountBalancesByNetwork = async ({
  account,
  network,
}: BalanceByNetworkProps) => {
  const res = await sendRequest({
    request: () => axios.get(getBackendUrl(`${account}/balances/${network}`)),
    onFaileReturnedValue: undefined,
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
