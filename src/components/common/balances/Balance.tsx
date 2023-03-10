import React from 'react'
import { formatBalance } from '@polkadot/util'
import BN from 'bn.js'
import { Compact } from '@polkadot/types'

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1
const K_LENGTH = 3 + 1

function format (value: Compact<any> | BN | string, currency: string, decimals: number, withSi?: boolean, _isShort?: boolean): React.ReactNode {
  const [ prefix, postfix ] = formatBalance(value, { forceUnit: '-', decimals, withSi: false }).split('.')
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH)

  if (prefix.length > M_LENGTH) {
    // TODO Format with balance-postfix
    const balance = formatBalance(value, { decimals, withUnit: false })
    return <>{balance}&nbsp;{currency}</>
  }

  return <>{prefix}{!isShort && (<>.<span className='DfBalanceDecimals'>{postfix || '0000'}</span></>)}&nbsp;{currency}</>
}

type FormatBalanceProps = {
  value?: Compact<any> | BN | string
  decimals?: number
  currency?: string
  isShort?: boolean
}

export const FormatBalance = ({
  value,
  decimals,
  currency,
  isShort,
  ...bareProps
}: FormatBalanceProps) => {
  if (!value) return null

  const { unit: defaultCurrency, decimals: defaultDecimal } = formatBalance.getDefaults()

  const balance = format(value, currency || defaultCurrency, decimals || defaultDecimal, isShort, isShort)

  return <span {...bareProps}>{balance}</span>
}
