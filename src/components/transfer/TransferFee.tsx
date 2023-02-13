import { toShortMoney } from '@subsocial/utils'
import clsx from 'clsx'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTokenAmountInUsd } from 'src/rtk/features/prices/pricesHooks'
import { MutedSpan } from '../utils/MutedText'
import { useFetchTransferFee } from 'src/rtk/features/fees/feesHooks'
import { TransferFeeParams } from 'src/rtk/features/fees/utils'
import { useChainToken } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { formatBalance } from '@polkadot/util'

type TransferFeeDefaultViewProps = {
  token: string
  amount: number
  className?: string
  label: string
  isLoading?: boolean
}

export type TransferFeeProps = Omit<TransferFeeDefaultViewProps, 'label' | 'amount'> & TransferFeeParams
export function TransferFee ({ source, token, dest, ...props }: TransferFeeProps) {
  const { fee, loading } = useFetchTransferFee({ source, token, dest })
  const { tokenDecimal } = useChainToken(source, fee?.token)

  const formattedFee = parseFloat(formatBalance(fee?.amount, { forceUnit: '-', decimals: tokenDecimal, withSi: false }))

  return <TransferFeeDefaultView {...props} isLoading={loading} amount={formattedFee} label='Transfer Fee' token={fee?.token ?? ''} />
}

export type CrossChainFeeProps = Omit<TransferFeeDefaultViewProps, 'label'>
export function CrossChainFee (props: CrossChainFeeProps) {
  const { t } = useTranslation()
  return <TransferFeeDefaultView {...props} label={t('transfer.crossChainFee')} />
}

function TransferFeeDefaultView ({ token, amount, className, label, isLoading }: TransferFeeDefaultViewProps) {
  const tokenUsd = useTokenAmountInUsd(token, amount)

  return (
    <div className={clsx('d-flex justify-content-between GapNormal', className)}>
      <span>{label}</span>
      {isLoading ? (
        <MutedSpan>Loading...</MutedSpan>
      ) : (
        <span className='font-weight-semibold'>
          <span>{toShortMoney({ num: amount, fractions: 6 })} {token}</span>
          {tokenUsd ? (
            <MutedSpan> (${toShortMoney({ num: tokenUsd, fractions: 4 })})</MutedSpan>
          ) : null}
        </span>
      )}
    </div>
  )
}