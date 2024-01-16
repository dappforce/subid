import copy from 'copy-to-clipboard'
import { CopyOutlined } from '@ant-design/icons'
import { showInfoMessage } from '../../../utils/Message'
import { useMyExtensionAddresses } from '../../../providers/MyExtensionAccountsContext'
import styles from './index.module.sass'
import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import BN from 'bignumber.js'
import clsx from 'clsx'
import { CSSProperties } from 'react'
import { AnyAccountId } from '@subsocial/api/types'
import { useSendEvent } from '@/components/providers/AnalyticContext'

export const BN_TEN = new BN(10)

export const useExtensionName = (address: AnyAccountId) => {
  const accounts = useMyExtensionAddresses()
  const extensionName = accounts?.find((x) => x.address === address)?.meta.name

  return extensionName?.replace('(polkadot-js)', '').toUpperCase()
}

type BalanceViewProps = {
  value?: string | BN
  symbol?: string
  startWithSymbol?: boolean
  fullPostfix?: boolean
  withComma?: boolean
  withSymbol?: boolean
  defaultPostfix?: string
  style?: CSSProperties
  className?: string
}

export const BalanceView = ({
  value,
  symbol,
  startWithSymbol = false,
  withComma = true,
  fullPostfix = false,
  withSymbol = true,
  defaultPostfix = '00',
  className,
  style,
}: BalanceViewProps) => {
  if (!value) return <>-</>

  let [ prefix, postfix ] = value.toString().split('.')

  if (!fullPostfix) {
    if (startWithSymbol) {
      postfix = postfix?.substring(0, 3)
    } else {
      postfix = postfix?.substring(0, 4)
    }
  }

  const lastSymbol = postfix?.slice(-1)

  /// K - kilo, M - million, B - billion
  const isPrefixInString = /^[KMB]/.test(lastSymbol)

  const postfixValue = postfix || defaultPostfix

  const symbolView = prefix && (
    <span className={clsx({ [styles.SymbolSize]: !startWithSymbol })}>
      {symbol}
    </span>
  )
  return (
    <span style={style} className={className}>
      {startWithSymbol && withSymbol && symbolView}
      <span>
        {withComma ? new Intl.NumberFormat().format(Number(prefix)) : prefix}
      </span>

      {postfixValue && (
        <>
          .
          <span className='DfBalanceDecimals'>
            {isPrefixInString ? postfixValue.slice(0, -1) : postfixValue}
          </span>
        </>
      )}
      {isPrefixInString && lastSymbol}
      <> {!startWithSymbol && withSymbol && symbolView}</>
    </span>
  )
}

type CopyAddressProps = {
  address: AnyAccountId
  message?: string
  children?: React.ReactNode
  className?: string
  isShortAddress?: boolean
  iconVisibility?: boolean
  isMonosizedFont?: boolean
  eventSource?: string
}

export const CopyAddress = ({
  address = '',
  message = 'Address copied',
  children = address,
  className,
  iconVisibility = false,
  isMonosizedFont = false,
  eventSource,
}: CopyAddressProps) => {
  const { t } = useTranslation()

  return (
    <Copy
      className={clsx('DfGreyLink', {
        [styles.Copy]: !iconVisibility,
      }, className)}
      text={address.toString()}
      message={message}
      eventSource={eventSource}
    >
      <Tooltip title={t('tooltip.copyAddress')}>
        <div
          className={clsx('d-flex align-items-center', {
            ['MonosizedFont']: isMonosizedFont,
          })}
        >
          {children}
          <CopyOutlined className='ml-1 grey-light DfGreyLink' />
        </div>
      </Tooltip>
    </Copy>
  )
}

type CopyProps = {
  text: string
  message: string
  children: React.ReactNode
  className?: string
  eventSource?: string
}

export const Copy = ({
  text,
  message,
  children,
  className,
  eventSource,
}: CopyProps) => {
  const sendEvent = useSendEvent()
  return (
    <div
      className={className}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        e.preventDefault()
        
        eventSource && sendEvent('full_address_copied', { eventSource })

        copy(text)
        showInfoMessage(message)
      }}
    >
      {children}
    </div>
  )
}

export const allAccountsAvatar = '/images/all-accounts.svg'
