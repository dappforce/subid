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
import { Transaction } from '../types'
import { toGenericAccountId } from '@/rtk/app/util'
import { usePrices } from '@/rtk/features/prices/pricesHooks'
import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import { FormatBalance } from '@/components/common/balances'
import { convertToBalanceWithDecimal } from '@subsocial/utils'
import { BalanceView } from '../../homePage/address-views/utils/index'
import { ExternalLink } from '../../identity/utils'

const subscanLinksByNetwork: Record<string, string> = {
  polkadot: 'https://polkadot.subscan.io/extrinsic/',
  kusama: 'https://kusama.subscan.io/extrinsic/',
}

type TransferRowProps = {
  item: Transaction
}

export const TransferRow = ({ item }: TransferRowProps) => {
  const prices = usePrices()
  const {
    txKind,
    amount,
    senderOrTargetPublicKey,
    blockchainTag,
    transaction,
  } = item

  const { decimal, tokenSymbol, icon } = useGetChainDataByNetwork(
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

  const time = new Date(item.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  })

  const balance = (
    <FormatBalance
      value={amount || '0'}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const extrinsicHash = transaction.transferNative.extrinsicHash

  const subscanUrl = `${
    subscanLinksByNetwork[blockchainTag.toLowerCase()]
  }${extrinsicHash}`

  const title = (
    <div className={styles.TransferTitle}>
      {titleByKind} <span>•</span>{' '}
      <ExternalLink
        url={subscanUrl}
        value={
          <MutedDiv className='d-flex align-items-center font-weight-normal'>
            Transfer <HiOutlineExternalLink className='ml-1' />
          </MutedDiv>
        }
      />
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
              icon={icon}
              size={'large'}
              className='bs-mr-2 align-items-start flex-shrink-none'
            />
            <div>
              <div className='font-weight-semibold FontNormal'>{title}</div>
              <MutedDiv>{time}</MutedDiv>
            </div>
          </div>
        </div>
        <div>
          <MutedDiv>{txKind === 'TRANSFER_TO' ? 'To' : 'From'}</MutedDiv>
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
      {/* <Divider className={clsx('m-0', styles.RowDivider)} /> */}
    </div>
  )
}
