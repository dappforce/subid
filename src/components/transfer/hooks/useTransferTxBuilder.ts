import {
  useChainToken,
} from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { TransferFormData } from '../utils'
import { getBalanceWithDecimal } from 'src/components/common/balances'
import { CrossChainTransferButtonProps } from '../cross-chain/CrossChainTransferButton'
import { useSameChainTransferExtrinsic } from '../configs/same-chain'

function parseTransferAmount (amount: string | number, tokenDecimal: number) {
  return getBalanceWithDecimal(amount, tokenDecimal).toFixed(0).toString()
}

export function useTransferTxBuilder (
  network: string,
  token: string,
  getTransferData: (crossChain: boolean) => TransferFormData
) {
  const { tokenDecimal } = useChainToken(network, token)

  const { getExtrinsic: getSameChainTransferExtrinsic, getParams: sameChainParamBuilder } = useSameChainTransferExtrinsic(network, token, () => {
    const { amount, recipient, tokenId } = getTransferData(false)
    return {
      amount: parseTransferAmount(amount, tokenDecimal),
      recipient,
      tokenId
    }
  })

  const crossChainParamBuilder: CrossChainTransferButtonProps['crossChainParam'] =
    () => {
      const {
        amount,
        recipient,
        destChain = '',
        token,
      } = getTransferData(true)
      return {
        amount: parseTransferAmount(amount, tokenDecimal),
        recipient,
        destChain,
        token,
      }
    }

  return {
    getSameChainTransferExtrinsic,
    sameChainParamBuilder,
    crossChainParamBuilder,
  }
}
