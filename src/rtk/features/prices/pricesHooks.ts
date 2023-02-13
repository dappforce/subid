import { useAppSelector } from '../../app/store'
import { selectPrices } from './pricesSlice'
import { MultiChainInfo } from '../multiChainInfo/types'

export const overriddenChainNames: Record<string, string> = {
  'bifrost': 'bifrost-native-coin',
  'khala': 'pha',
  'calamari': 'calamari-network',
  'darwinia': 'darwinia-network-native-token',
  'darwinia-crab': 'darwinia-crab-network',
  'crust': 'crust-network',
  'kilt': 'kilt-protocol',
  'robonomics': 'robonomics-network',
  'bitCountry': 'metaverse-network-pioneer',
  'parallel': 'parallel-finance',
  'hydra-dx': 'hydradx'
}

export const statemineAssets = [ 'rmrk' ]
const additionalTokens = [ 'zenlink-network-token', 'weth', 'wrapped-bitcoin' ]

export const getChainsNamesForCoinGecko = (chainsInfo: MultiChainInfo) => {
  const chainInfoKeys = chainsInfo ? Object.keys(chainsInfo) : []

  chainInfoKeys.push(...statemineAssets, ...additionalTokens)

  return chainInfoKeys.map((network) => overriddenChainNames[network] || network).join(',')
}

export const usePrices = () => {
  return useAppSelector<any[] | undefined>(selectPrices)
}

export const useTokenPrice = (token: string) => {
  const tokenPrices = usePrices()
  if (!token) return 0

  let tokenData = tokenPrices?.find((priceData) => {
    return priceData.symbol === token.toLowerCase()
  })
  if (!tokenData) return 0
  
  return parseFloat(tokenData.current_price)
}

export const useTokenAmountInUsd = (token: string, amount: number) => {
  const tokenPrice = useTokenPrice(token)
  return tokenPrice * amount
}
