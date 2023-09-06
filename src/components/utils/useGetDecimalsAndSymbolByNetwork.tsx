import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'

export const useGetDecimalsAndSymbolByNetwork = (network: string) => {
  const chainsInfo = useChainInfo()

  const chainInfo = chainsInfo?.[network]

  const { tokenDecimals, tokenSymbols, nativeToken } = chainInfo || {}

  const tokenSymbol = tokenSymbols?.[0] || nativeToken

  const decimal = tokenDecimals?.[0] || 0

  return { decimal, tokenSymbol }
}