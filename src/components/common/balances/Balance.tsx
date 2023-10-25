import React from 'react'
import { formatBalance } from '@polkadot/util'
import BN from 'bn.js'
import { Compact } from '@polkadot/types'

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1
const K_LENGTH = 3 + 1

function format (
  value: Compact<any> | BN | string,
  currency: string,
  decimals: number,
  withSi?: boolean,
  _isShort?: boolean,
  isGrayDecimal?: boolean,
  withCurrency?: boolean
): React.ReactNode {
  if(!value || value === 'NaN') return null
  const [ prefix, postfix ] = formatBalance(value, {
    forceUnit: '-',
    decimals,
    withSi: false,
  }).split('.')
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH)

  if (prefix.length > M_LENGTH) {
    // TODO Format with balance-postfix
    const balance = formatBalance(value, { decimals, withUnit: false })
    return (
      <>
        {balance}{withCurrency && <>&nbsp;{currency}</>}
      </>
    )
  }

  return (
    <>
      {prefix}
      {!isShort && postfix !== '0000' && (
        <>
          .
          <span className={isGrayDecimal ? 'DfBalanceDecimals' : ''}>
            {postfix ? postfix.replace(/0+$/, '') : '0000'}
          </span>
        </>
      )}
      {withCurrency && <>&nbsp;{currency}</>}
    </>
  )
}

type FormatBalanceProps = {
  value?: Compact<any> | BN | string
  decimals?: number
  currency?: string
  isShort?: boolean
  isGrayDecimal?: boolean
  withCurrency?: boolean
}

export const FormatBalance = ({
  value,
  decimals,
  currency,
  isShort,
  isGrayDecimal = true,
  withCurrency = true,
  ...bareProps
}: FormatBalanceProps) => {
  if (!value) return null

  const { unit: defaultCurrency, decimals: defaultDecimal } =
    formatBalance.getDefaults()

  const balance = format(
    value,
    currency || defaultCurrency,
    decimals || defaultDecimal,
    isShort,
    isShort,
    isGrayDecimal,
    withCurrency
  )

  return <span {...bareProps}>{balance}</span>
}
