import { formatBalance } from '@polkadot/util'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useBalancesByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { useChainToken } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { getTransferableBalance } from '../balance'

export const useTransferableBalance = (token: string, network: string, address?: string) => {
  const myAddress = useMyAddress()
  const usedAddress = address || myAddress
  const balance = useBalancesByNetwork({
    address: usedAddress,
    currency: token,
    network
  })
  const transferableBalance = getTransferableBalance(balance)
  
  const { tokenDecimal, existentialDeposit } = useChainToken(network, token)
  const formattedBalance = formatBalance(transferableBalance, { forceUnit: '-', decimals: tokenDecimal, withSi: false })
  return { transferableBalance, formattedTransferableBalance: parseFloat(formattedBalance), tokenDecimal, existentialDeposit }
}
