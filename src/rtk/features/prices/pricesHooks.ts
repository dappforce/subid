import { useAppSelector } from '../../app/store'
import { PricesEntity, selectPrices } from './pricesSlice'
import { MultiChainInfo } from '../multiChainInfo/types'
import { isEmptyObj } from '@subsocial/utils'

export const overriddenChainNames: Record<string, string> = {
  bifrostKusama: 'bifrost-native-coin',
  khala: 'pha',
  calamari: 'calamari-network',
  darwinia: 'darwinia-network-native-token',
  'darwinia-crab': 'darwinia-crab-network',
  crust: 'crust-network',
  kilt: 'kilt-protocol',
  robonomics: 'robonomics-network',
  bitCountry: 'metaverse-network-pioneer',
  parallel: 'parallel-finance',
  pendulum: 'pendulum-chain',
  unique: 'unique-network',
  manta: 'manta-network',
  continuum: 'mnet-continuum',
}

export const statemineAssets = [ 'rmrk' ]
const additionalTokens = [ 'zenlink-network-token', 'weth', 'wrapped-bitcoin' ]

export const getChainsNamesForCoinGecko = (chainsInfo: MultiChainInfo) => {
  let keys: string[] = []

  if (chainsInfo && !isEmptyObj(chainsInfo)) {
    keys = [ ...Object.keys(chainsInfo), ...statemineAssets, ...additionalTokens ]
  }

  return keys
    .map((network) => overriddenChainNames[network] || network)
    .join(',')
}

export const usePricesData = () => {
  return useAppSelector<PricesEntity | undefined>(selectPrices)
}

export const usePrices = () => {
  return usePricesData()?.pricesData?.prices
}

export const useTokenPrice = (token: string) => {
  const prices = usePrices()

  if (!token) return 0

  let tokenData = prices?.find((priceData) => {
    return priceData.symbol === token.toLowerCase()
  })
  if (!tokenData) return 0

  return parseFloat(tokenData.current_price)
}

export const useTokenAmountInUsd = (token: string, amount: number) => {
  const tokenPrice = useTokenPrice(token)
  return tokenPrice * amount
}
