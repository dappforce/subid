import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'

export const useGetChainDataByNetwork = (network: string) => {
  const chainsInfo = useChainInfo()

  const chainInfo = chainsInfo?.[network]

  const { tokenDecimals, tokenSymbols, nativeToken, ...otherData } = chainInfo || {}

  const tokenSymbol = tokenSymbols?.[0] || nativeToken

  const decimal = tokenDecimals?.[0] || 0

  return { decimal, tokenSymbol, ...otherData }
}