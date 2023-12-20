import { useChainInfo } from '@/rtk/features/multiChainInfo/multiChainInfoHooks'
import { useMemo } from 'react'
import { tokenSelectorEncoder } from '../form-items/TokenSelector'

const useGetTokensOptions = () => {
  const chainsInfo = useChainInfo()

  return useMemo(() => {
    const tokenMap: string[] = []

    Object.values(chainsInfo).forEach(
      ({
        nativeToken,
        tokenSymbols,
        id: networkId,
        assetsRegistry,
        isTransferable,
        tokenTransferMethod,
      }) => {
        const nativeTokenSymbol = nativeToken || tokenSymbols?.[0]
        if (!nativeTokenSymbol || !isTransferable) return

        tokenSelectorEncoder.encode({
          token: nativeTokenSymbol,
          network: networkId,
        })

        tokenMap.push(
          tokenSelectorEncoder.encode({
            token: nativeTokenSymbol,
            network: networkId,
          })
        )

        if (!assetsRegistry || !tokenTransferMethod) return

        Object.values(assetsRegistry).forEach((asset) => {
          const tokenSymbol = asset.symbol
          if (tokenSymbol === nativeTokenSymbol) return

          const currency = asset.currency
          if (!currency) return
          const tokenId = currency.id || currency

          tokenMap.push(
            tokenSelectorEncoder.encode({
              token: tokenSymbol,
              network: networkId,
              tokenId: { id: tokenId },
            })
          )
        })
      }
    )
    return tokenMap
  }, [ chainsInfo ])
}

export default useGetTokensOptions