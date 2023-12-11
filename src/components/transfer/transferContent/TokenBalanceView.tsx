import clsx from 'clsx'
import React, { HTMLProps } from 'react'
import { FormatBalance } from '../../common/balances'
import { MutedSpan } from '../../utils/MutedText'
import { useTransferableBalance } from 'src/utils/hooks/useTransferableBalance'
import { Skeleton } from 'antd'
import styles from '../Index.module.sass'

export type TokenBalanceViewProps = HTMLProps<HTMLDivElement> & {
  network?: string
  token: string
  label?: string
  address?: string
}

export default function TokenBalanceView ({
  label,
  network,
  token,
  address,
  className,
  ...props
}: TokenBalanceViewProps) {
  const { transferableBalance, tokenDecimal, loading } = useTransferableBalance(
    token,
    network ?? '',
    address
  )

  return (
    <div className={clsx('d-flex align-items-center', className)} {...props}>
      {label && (
        <div className='mr-1'>
          <MutedSpan>{label}</MutedSpan>
        </div>
      )}
      <div className='font-weight-semibold'>
        {loading ? (
          <Skeleton paragraph={{ rows: 0 }} className={styles.BalanceSkeleton} />
        ) : (
          <FormatBalance
            value={transferableBalance}
            decimals={tokenDecimal}
            currency={token}
          />
        )}
      </div>
    </div>
  )
}
