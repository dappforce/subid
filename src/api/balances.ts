import { isEthereumAddress } from '@polkadot/util-crypto'
import {
  supportedNetworks,
  evmLikeNetworks,
} from '../rtk/features/multiChainInfo/types'
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
    onFailedText: `Failed to get balances by account: ${account}`,
  })

  return res ? { network, info: res } : undefined
}

export const getAccountBalances = async (account: string) => {
  const networks = isEthereumAddress(account)
    ? evmLikeNetworks
    : supportedNetworks

  const res = await sendGetRequest({
    params: {
      url: 'balances',
      config: {
        params: {
          networks,
          account
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to get balances',
  })

  return res
}
