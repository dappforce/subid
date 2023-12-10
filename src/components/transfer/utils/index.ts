import { FormInstance } from 'antd'
import { TokenData, tokenSelectorEncoder } from '../form-items/TokenSelector'
import { getCrossChainAdapter } from '../configs/cross-chain'
import { TransferFormDefaultToken } from '../transferContent/TransferForm'

export type TransferFormData = {
  recipient: string
  amount: string
  token: string
  sourceChain: string
  destChain?: string
  tokenId: any
}

export type FormFields = {
  token: string
  crossChainToken: string
  amount: string
  source: string
  dest: string
  recipient: string
}
export const transferFormField = (name: keyof FormFields) => name

type MinimalFormInstance = { getFieldsValue: FormInstance['getFieldsValue'] }
export function getTransferFormData (
  form: MinimalFormInstance,
  crossChain: boolean
): TransferFormData {
  const formValues = form.getFieldsValue()
  const tokenData =
    formValues[transferFormField(crossChain ? 'crossChainToken' : 'token')]
  const {
    token,
    network = '',
    tokenId,
  } = tokenSelectorEncoder.decode(tokenData)

  const source = formValues[transferFormField('source')]
  const dest = formValues[transferFormField('dest')]

  const usedSource = crossChain ? source : network

  return {
    recipient: formValues[transferFormField('recipient')],
    amount: formValues[transferFormField('amount')],
    sourceChain: usedSource,
    destChain: crossChain ? dest : undefined,
    token,
    tokenId: crossChain ? undefined : tokenId,
  }
}

export type CrossChainFee = { balance: number; token: string }
export const getCrossChainFee = (form: MinimalFormInstance): CrossChainFee => {
  const { destChain, sourceChain, token } = getTransferFormData(form, true)

  const adapter = getCrossChainAdapter(sourceChain)
  if (!destChain || !token || !adapter) return { balance: 0, token: '' }

  try {
    const fee = adapter.getCrossChainFee(token, (destChain ?? '') as any)
    return {
      balance: fee.balance.toNumber(),
      token: fee.token,
    }
  } catch (e) {
    console.log(e)
    return { balance: 0, token: '' }
  }
}

export const getDefaultSelectorOption = (
  tokensOptions: string[],
  defaultSelectedToken: TransferFormDefaultToken
) => {
  const encodedTokenData = tokensOptions.find((item) => {
    const { token, network } = tokenSelectorEncoder.decode(item)

    if (defaultSelectedToken.network) {
      return (
        token.toLowerCase() === defaultSelectedToken.token.toLowerCase() &&
        network === defaultSelectedToken.network
      )
    }

    return (
      token.toLowerCase() ===
      defaultSelectedToken.token.toLowerCase()
    )
  })

  const decodedTokenData =
    tokenSelectorEncoder.decode(encodedTokenData || '') || {}


  let tokenData: TokenData = decodedTokenData

  if (!decodedTokenData.network) {
    const firstEncodedTokenDataByToken = tokensOptions.find((item) => {
      const { token } = tokenSelectorEncoder.decode(item)
      return token.toLowerCase() === defaultSelectedToken.token.toLowerCase()
    })

    tokenData =
      tokenSelectorEncoder.decode(firstEncodedTokenDataByToken || '') || {}
  }

  return {
    token: tokenData.token || 'DOT',
    network: tokenData.network || 'polkadot',
    tokenId: tokenData.tokenId,
  }
}
