import { formatBalance, formatNumber } from '@polkadot/util'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'

export const simpleFormatBalance = (balance: BN | string | number, decimals?: number, currency?: string, withUnit = true) => {
  const { unit, decimals: defaultDecimals } = formatBalance.getDefaults()

  return formatBalance(balance, { decimals: decimals || defaultDecimals, forceUnit: currency || unit, withUnit })
}

const TEN_BN = new BigNumber(10)

export const getBalanceWithDecimal = (balance: string | number, decimal: number) =>
  new BigNumber(balance).multipliedBy(TEN_BN.pow(new BigNumber(decimal)))

export const convertToBalanceWithDecimal = (balance: string | number, decimal: number) =>
  new BigNumber(balance).dividedBy(TEN_BN.pow(new BigNumber(decimal)))

export const formatBalanceWithoutDecimals = (balance: BigNumber, symbol: string) =>
  `${formatNumber(new BN(balance.toString()))} ${symbol}`

type ShortMoneyProps = {
  num: number
  prefix?: string
  fractions?: number
  customFraction?: number
}

function moneyToString ({ num, prefix, fractions = 2, customFraction }: ShortMoneyProps) {
  const _fractions = num < 1 ? fractions : 1
  return `${prefix ? prefix : ''}${num.toFixed(customFraction || _fractions)}`
}

const num1K = 1000
const num1M = num1K ** 2
const num1B = num1K ** 3
const num1T = num1K ** 4

export function toShortMoney ({ num, ...props }: ShortMoneyProps): string {
  if (num >= num1K && num < num1M) {
    return moneyToString({ num: num / num1K, ...props }) + 'K'
  } else if (num >= num1M && num < num1B) {
    return moneyToString({ num: num / num1M, ...props }) + 'M'
  } else if (num >= num1B && num < num1T) {
    return moneyToString({ num: num / num1B, ...props }) + 'B'
  }
  return moneyToString({ num, ...props })
}
