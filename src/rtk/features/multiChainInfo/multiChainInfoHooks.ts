import { chainInfoActions, selectChainInfoByNetwork, selectChainInfoList } from './multiChainInfoSlice'
import { useAppSelector, useAppDispatch } from '../../app/store'
import { MultiChainInfo } from './types'
import { Dispatch } from 'react'
import { AnyAction } from 'redux'
import { NetworkByParaId } from './networkByParaId'
import { formatBalance } from '@polkadot/util'

export const fetchChainInfo = (dispatch: Dispatch<AnyAction>) =>
  dispatch(chainInfoActions.fetchChainInfo())

export const useChainInfo = (): MultiChainInfo => {
  return useAppSelector<MultiChainInfo>(selectChainInfoList)
}

export const useChainInfoByNetwork = (network: string) => {
  return useAppSelector((state) => selectChainInfoByNetwork(state, network))
}

export const useChainToken = (network: string, token?: string) => {
  const chainInfo = useChainInfoByNetwork(network)
  const { tokenDecimals, tokenSymbols, nativeToken } = chainInfo || {}
  const { unit: defaultCurrency, decimals: defaultDecimal } = formatBalance.getDefaults()
  const nativeTokenSymbol = nativeToken || tokenSymbols?.[0] || defaultCurrency
  const nativeTokenDecimal = tokenDecimals?.[0] || defaultDecimal
  const nativeExistentialDeposit = parseFloat(formatBalance(chainInfo?.existentialDeposit, { forceUnit: '-', decimals: nativeTokenDecimal, withSi: false }))

  let tokenDecimal = defaultDecimal
  let existentialDeposit: number | undefined = undefined
  if (token === nativeTokenSymbol) {
    tokenDecimal = nativeTokenDecimal
    existentialDeposit = nativeExistentialDeposit
  } else if (token) {
    let asset = chainInfo?.assetsRegistry?.[token]
    if (!asset) {
      const foundKey = Object.keys(chainInfo?.assetsRegistry ?? {}).find((key) => key.toLowerCase() === token.toLowerCase()) ?? ''
      asset = chainInfo?.assetsRegistry?.[foundKey]
    }
    const decimal = parseInt(asset?.decimals) || 0
    tokenDecimal = decimal
    const rawExistentialDeposit = asset?.minimalBalance || 0
    existentialDeposit = parseFloat(formatBalance(rawExistentialDeposit, { forceUnit: '-', decimals: tokenDecimal, withSi: false }))
  }

  return {
    nativeToken: nativeTokenSymbol,
    nativeTokenDecimal,
    nativeExistentialDeposit,
    token,
    tokenDecimal,
    existentialDeposit,
  }
}

export const useNetworkByParaId = () => {
  return useAppSelector<NetworkByParaId>((state) => state.networkByParaId.networkByParaId)
}

export const useFetchStakingConsts = (network: string) => {
  const dispatch = useAppDispatch()

  dispatch(chainInfoActions.fetchStakingConsts(network))
}