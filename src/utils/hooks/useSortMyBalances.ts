import { useMemo } from 'react'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { getBalanceWithDecimals, getDecimalsAndSymbol, getPrice, getTotalBalance } from 'src/components/table/utils'
import { useManyBalances } from 'src/rtk/features/balances/balancesHooks'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { usePrices } from 'src/rtk/features/prices/pricesHooks'

export const useSortMyBalances = () => {
  const myAddress = useMyAddress()
  const chainsInfo = useChainInfo()
  const tokenPrices = usePrices()
  const balances = useManyBalances(myAddress ? [ myAddress ] : [])
  const myBalances = balances?.[myAddress || '']?.balances || []

  const sortedBalances = useMemo(() => {
    const myTokens: { value: number; token: string }[] = []
    myBalances.forEach(({ info, network }) => {
      const chainInfo = chainsInfo[network]
      Object.entries(info).forEach(([ symbol, balancesData ]) => {
        const { decimal } = getDecimalsAndSymbol(chainInfo, symbol)
        if (!decimal) return
        const { totalBalance } = balancesData
        const balance = getBalanceWithDecimals({ totalBalance: totalBalance ?? '0', decimals: decimal })
        const price = getPrice(tokenPrices, 'symbol', symbol)
        const totalValue = getTotalBalance(balance, price)
        myTokens.push({ token: symbol, value: totalValue.toNumber() })
      })
    })

    return myTokens.sort((a, b) => b.value - a.value)
  }, [ chainsInfo, myBalances, tokenPrices ])

  return sortedBalances
}
