import { useChainInfoByNetwork } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { getExtrinsicParams } from 'src/utils/extrinsicDecoder'

const getCustomTransferParamId = (token: string, network: string) => `${token}|${network}`
export type SameChainTransferParamData = {
  amount: string
  recipient: string
  tokenId?: any
}
const customSameChainTransferConfig: {
  [key: string]: {
    getParams: (
      data: SameChainTransferParamData,
    ) => any[]
    extrinsic: string
  }
} = {
  [getCustomTransferParamId('MGX', 'mangata')]: {
    extrinsic: 'tokens.transfer',
    getParams: (data) => {
      return [ data.recipient, 0, data.amount ]
    },
  },
  [getCustomTransferParamId('KINT', 'kintsugi')]: {
    extrinsic: 'tokens.transfer',
    getParams: (data) => {
      return [ data.recipient, { Token: 'KINT' }, data.amount ]
    },
  },
  [getCustomTransferParamId('INTR', 'interlay')]: {
    extrinsic: 'tokens.transfer',
    getParams: (data) => {
      return [ data.recipient, { Token: 'INTR' }, data.amount ]
    },
  },
}

export function useSameChainTransferExtrinsic (network: string, token: string, getTransferData: () => SameChainTransferParamData) {
  const chainInfo = useChainInfoByNetwork(network)

  const getExtrinsic = () => {
    const { tokenId } = getTransferData()
    const customConfig = customSameChainTransferConfig[getCustomTransferParamId(token, network)]
    if (customConfig) {
      return customConfig.extrinsic
    } else if (!tokenId) {
      return 'balances.transfer'
    } else {
      return chainInfo?.tokenTransferMethod
    }
  }

  const getParams = () => {
    const transferData = getTransferData()
    const { amount, recipient, tokenId } = transferData

    const customGetter = customSameChainTransferConfig[getCustomTransferParamId(token, network)]
    if (customGetter) return customGetter.getParams({ ...transferData })

    if (!tokenId) {
      return [ recipient, amount ]
    }

    const method = chainInfo?.tokenTransferMethod
    return getExtrinsicParams(method ?? '', {
      recipient,
      id: tokenId.id,
      amount,
    })
  }

  return { getParams, getExtrinsic }
}
