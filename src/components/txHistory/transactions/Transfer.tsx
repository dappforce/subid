import styles from './Transactions.module.sass'
import {
  Address,
  AccountPreview,
  AvatarOrSkeleton,
  getPrice,
} from '../../table/utils'
import { MutedDiv } from '../../utils/MutedText'
import { HiOutlineExternalLink } from 'react-icons/hi'
import clsx from 'clsx'
import { Divider } from 'antd'
import { Transaction } from '../types'
import { toGenericAccountId } from '@/rtk/app/util'
import { usePrices } from '@/rtk/features/prices/pricesHooks'
import { useGetDecimalsAndSymbolByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import { FormatBalance } from '@/components/common/balances'
import { convertToBalanceWithDecimal } from '@subsocial/utils'
import { BalanceView } from '../../homePage/address-views/utils/index'

type TransferRowProps = {
  item: Transaction
}

export const TransferRow = ({ item }: TransferRowProps) => {
  const prices = usePrices()
  const { txKind, amount, senderOrTargetPublicKey, blockchainTag } = item

  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork(
    blockchainTag.toLowerCase()
  )

  const address = toGenericAccountId(senderOrTargetPublicKey)

  const balanceWithDecimals = convertToBalanceWithDecimal(amount, decimal)

  const price = getPrice(prices, 'symbol', tokenSymbol)

  const totalBalanceBN = balanceWithDecimals.multipliedBy(price || '0')

  const totalBalance = (
    <BalanceView value={totalBalanceBN} symbol='$' startWithSymbol />
  )

  const titleByKind = txKind === 'TRANSFER_TO' ? 'Sent' : 'Received'

  const balance = (
    <FormatBalance
      value={amount || '0'}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const title = (
    <div className={styles.TransferTitle}>
      {titleByKind} <span>•</span>{' '}
      <MutedDiv className='d-flex align-items-center font-weight-normal'>
        Transfer <HiOutlineExternalLink className='ml-1' />
      </MutedDiv>
    </div>
  )

  return (
    <div>
      <div className={styles.TransferRow}>
        <div className={styles.FirstCol}>
          <div
            className={clsx(
              'd-flex align-items-center',
              styles.FirstColContent
            )}
          >
            <AvatarOrSkeleton
              icon={'/polkadot.svg'}
              size={'large'}
              className='bs-mr-2 align-items-start flex-shrink-none'
            />
            <div>
              <div className='font-weight-bold FontNormal'>{title}</div>
              <MutedDiv>21:34</MutedDiv>
            </div>
          </div>
        </div>
        <div>
          <MutedDiv>To</MutedDiv>
          <AccountPreview withAddress={false} account={address} />
          <Address
            name='Polkadot'
            accountId={address}
            isShortAddress
            withCopy
            withQr={false}
          />
        </div>
        <div className='text-right'>
          <div
            className={clsx(styles.Tokens, {
              [styles.RecievedTokens]: txKind === 'TRANSFER_FROM',
            })}
          >
            {balance}
          </div>
          <MutedDiv className={styles.Dollars}>{totalBalance}</MutedDiv>
        </div>
      </div>
      <Divider className={clsx('m-0', styles.RowDivider)} />
    </div>
  )
}
