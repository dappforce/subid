import { LoadingOutlined } from '@ant-design/icons'
import { Button, ButtonProps } from 'antd'
import { AccountId, DispatchError } from '@polkadot/types/interfaces'
import { GenericAccountId, Option, Text } from '@polkadot/types'
import store from 'store'
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon'
import { memoize } from 'lodash'
import { encodeAddress, isEthereumAddress } from '@polkadot/util-crypto'
import config from 'src/config'
import { isEmptyArray } from '@subsocial/utils'
import { CURRENT_WALLET } from '../wallets/wallet-list/WalletsList'
import { InstallUrl, Urls } from '../wallets/types'
import BN from 'bignumber.js'
import { usePrices } from '../../rtk/features/prices/pricesHooks'
import {
  BALANCE_SHOW_ZERO_BALANCES,
  BALANCE_TABLE_VARIANT,
  BALANCE_TABLE_VIEW,
  getPrice,
  getTotalBalance,
} from '../table/utils'
import { useChainInfo } from '../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { BalanceView } from '../homePage/address-views/utils/index'
import { SubmittableResult } from '@polkadot/api'
import { showErrorMessage } from './Message'
import clsx from 'clsx'
import { MultiChainInfo } from '../../rtk/features/multiChainInfo/types'
import { asAccountId } from '@subsocial/api'
import { CID } from 'ipfs-http-client'
import registry from '@subsocial/api/utils/registry'
import { AnyAccountId } from '@subsocial/api/types'

export const MINUTES = 1000 * 60

const SUBSOCIAL_SS58_PREFIX = 28

const { appBaseUrl, ipfsUrl } = config

export type AnyText = string | Text | Option<Text>
export type AnyAddress =
  | string
  | AccountId
  | GenericAccountId
  | Option<AccountId>
  | Option<GenericAccountId>

function toString<DFT> (
  value?: { toString: () => string },
  _default?: DFT
): string | DFT | undefined {
  return value && typeof value.toString === 'function'
    ? value.toString()
    : _default
}

type LoadingProps = {
  label?: React.ReactNode
  style?: React.CSSProperties
  center?: boolean
}

export const Loading = ({ label, style, center = true }: LoadingProps) => {
  const alignCss = center ? 'justify-content-center align-items-center' : ''
  return (
    <div
      className={`d-flex w-100 h-100 flex-sm-fill ${alignCss}`}
      style={style}
    >
      <LoadingOutlined />
      {label && <em className='bs-ml-3 text-muted'>{label}</em>}
    </div>
  )
}

type MaybeAccAddr = undefined | AnyAccountId

export function equalAddresses (
  addr1: MaybeAccAddr,
  addr2: MaybeAccAddr
): boolean {
  if (addr1 === addr2) {
    return true
  } else if (!addr1 || !addr2) {
    return false
  } else {
    return asAccountId(addr1)?.eq(asAccountId(addr2)) || false
  }
}

export const getPriceByNetwork = (
  network: string,
  chainsInfo: MultiChainInfo,
  prices: any | undefined
) => {
  const { nativeToken, tokenSymbols } = chainsInfo?.[network] || {}

  const symbol = tokenSymbols?.[0] || nativeToken

  return getPrice(prices, 'symbol', symbol)
}

export const getTokenSymbol = (network: string, chainsInfo: MultiChainInfo) => {
  const { tokenSymbols, nativeToken } = chainsInfo[network] || {}

  return tokenSymbols?.[0] || nativeToken
}

export const getTokenDecimals = (
  network: string,
  chainsInfo: MultiChainInfo
) => {
  const { tokenDecimals } = chainsInfo[network] || {}

  return tokenDecimals?.[0] || 0
}

type LinkProps = {
  href: string
  target?: string
}

type ButtonLinkProps = LinkProps & ButtonProps

export const ButtonLink = ({
  href,
  target,
  children,
  ...buttonProps
}: ButtonLinkProps) => (
  <Button {...buttonProps}>
    <a href={href} target={target}>
      {children}
    </a>
  </Button>
)

export const toShortAddress = (_address: AnyAccountId, halfLength?: number) => {
  const address = (_address || '').toString()

  const addressLength = halfLength ? halfLength : 6

  return address.length > 13
    ? `${address.slice(0, addressLength)}…${address.slice(-addressLength)}`
    : address
}

export const tryParseInt = (maybeNum: string | number, def: number): number => {
  if (typeof maybeNum === 'number') {
    return maybeNum
  }
  try {
    return parseInt(maybeNum)
  } catch (err) {
    return def
  }
}

export type HasAddress = {
  address: AnyAccountId
}

export function stringifyAny<DFT> (
  value?: any,
  _default?: DFT
): string | DFT | undefined {
  if (typeof value !== 'undefined') {
    if (value instanceof Option) {
      return stringifyText(value.unwrapOr(undefined))
    }
    return toString(value)
  }
  return _default
}

export function stringifyText<DFT extends string> (
  value?: AnyText,
  _default?: DFT
): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export function stringifyAddress<DFT> (
  value?: AnyAddress,
  _default?: DFT
): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export function isServerSide (): boolean {
  return typeof window === 'undefined'
}

export function isClientSide (): boolean {
  return !isServerSide()
}

export const isHomePage = (): boolean =>
  isClientSide() && window.location.pathname === '/'

export const isCreatorStakingPage = (): boolean =>
  isClientSide() && window.location.pathname === '/creators'

export const isAccountsPage = (): boolean =>
  isClientSide() &&
  window.location.pathname === '/accounts' &&
  window.location.search === ''

export const isFavorites = (): boolean =>
  isClientSide() &&
  window.location.pathname === '/favorites' &&
  window.location.search === ''

export const startWithUpperCase = (str?: string) =>
  str?.replace(/(?:^\s*|\s+)(\S?)/g, (b) => b.toUpperCase()) || ''

export const getAddressFromStorage = (): string => store.get('MyAddress')

export const getCurrentWallet = (): string => store.get(CURRENT_WALLET)

export const setCurrentWallet = (currentWallet: string) =>
  store.set(CURRENT_WALLET, currentWallet)

export const setAddressToStorage = (address: string) => {
  store.set('MyAddress', address)
}

export const signOut = () => store.remove('MyAddress')

type SubIconProps = IconBaseProps & {
  Icon: (props: any) => JSX.Element
}

export function SubIcon ({ Icon, className, ...props }: SubIconProps) {
  return <Icon className={`anticon ${className}`} {...props} />
}

export const isValidAddress = (
  address?: string,
  acceptFormat = { eth: true, substrate: true }
) => {
  try {
    if (acceptFormat.eth && isEthereumAddress(address)) return true

    if (!acceptFormat.substrate) return false
    const genericAddress = new GenericAccountId(registry, address)
    return !!genericAddress
  } catch {
    return false
  }
}

export const isValidAddresses = (addresses?: string[]) =>
  addresses && !isEmptyArray(addresses)
    ? addresses.every((address) => isValidAddress(address))
    : false

/** Memoized resolver of IPFS CID to a full URL. */
export const resolveIpfsUrl = memoize((cidOrUrl: string) => {
  try {
    if (CID.parse(cidOrUrl)) {
      return `${ipfsUrl}/ipfs/${cidOrUrl}`
    }
  } catch (err) {
    // It's OK
  }

  // Looks like CID is already a resolved URL.
  return cidOrUrl
})

export const accountIdToSubsocialAddress = (address: AnyAccountId) =>
  isEthereumAddress(address.toString())
    ? address
    : convertAddressToChainFormat(address.toString(), SUBSOCIAL_SS58_PREFIX)

export const convertAddressToChainFormat = (
  address?: string,
  ss58Format?: number
) => {
  if (
    !address ||
    ss58Format === undefined ||
    isEthereumAddress(address) ||
    !isValidAddress(address)
  )
    return

  return encodeAddress(address.toString(), ss58Format)
}

export const convertToKusamaAddress = (address?: string) =>
  convertAddressToChainFormat(address, 2) || ''

export const getIconUrl = (icon: string) => `/images/${icon}`

export const innerFullUrl = (appBaseUrl: string, relative: string) => {
  if (relative.startsWith(appBaseUrl)) return relative

  const base = appBaseUrl.endsWith('/') ? appBaseUrl : appBaseUrl + '/'
  const pathname = relative.startsWith('/') ? relative.substr(1) : relative

  return base + pathname
}

export const fullUrl = (relative: string, externalBaseUrl?: string) =>
  innerFullUrl(externalBaseUrl || appBaseUrl, relative)

export const openNewWindow = (url: string) =>
  window.open(
    url,
    '_blank',
    'toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400'
  )

export const resolveUrlWithAddress = (address: string) =>
  `${appBaseUrl}/${address}`

export const checkIsMulti = (accounts?: string) =>
  accounts ? accounts.split(',').length > 1 : false

export const parseAddressFromUrl = (address: string | string[]) =>
  address?.toString().split(',')

const browsers = [ 'Chrome', 'Firefox' ]

export const detectBrowser = () => {
  let browser = 'Unknown'

  for (let browserName of browsers) {
    if (navigator.userAgent.indexOf(browserName) != -1) {
      browser = browserName
      break
    }
  }

  return browser
}

export const getInstallUrl = (instalUrls: InstallUrl) => {
  const browser = detectBrowser()

  return instalUrls[browser as Urls]
}

type PriceViewProps = {
  value: string | BN
  network: string
}

export const PriceView = ({ value, network }: PriceViewProps) => {
  const prices = usePrices()
  const chainsInfo = useChainInfo()

  const { tokenSymbols, nativeToken } = chainsInfo[network] || {}

  const symbol = tokenSymbols?.[0] || nativeToken

  const price = getPrice(prices, 'symbol', symbol)

  const valueInDollars = getTotalBalance(new BN(value), price)
  return (
    <BalanceView
      value={valueInDollars.toFormat().replace(/,/g, '')}
      symbol={'$'}
      startWithSymbol
    />
  )
}

export function checkSameAttributesValues<T> (
  obj1: T,
  obj2: T,
  keysToCheck: (keyof T)[]
) {
  return keysToCheck.every((key) => obj1[key] === obj2[key])
}

export const showParsedErrorMessage = (result: SubmittableResult | null) => {
  let errorMessage = 'An extrinsic failed.'

  const events = result?.events

  if (!events || isEmptyArray(events)) return

  const failedEvent = events?.find(
    (event) => event.event.method === 'ExtrinsicFailed'
  )

  const dispatchError = failedEvent?.event.data[0] as DispatchError | undefined

  const dispatchErrorModuleData =
    dispatchError && dispatchError.isModule
      ? dispatchError.asModule.toU8a()
      : undefined

  if (dispatchErrorModuleData) {
    const { docs, method } =
      failedEvent?.registry?.findMetaError(dispatchErrorModuleData) || {}

    if (docs && !isEmptyArray(docs)) {
      errorMessage = docs[0]
    } else {
      errorMessage = errorMessage + ` ${method}`
    }
  }

  showErrorMessage(errorMessage)
}

type PageTitleProps = {
  title: React.ReactNode
  link?: React.ReactNode
  desc?: React.ReactNode
  className?: string
}

export const PageTitle = ({ title, desc, link, className }: PageTitleProps) => (
  <div className={clsx('DfPageTitle', className)}>
    <div
      className={clsx({
        ['d-flex align-items-center justify-content-between']: link,
      })}
    >
      <h2>{title}</h2>
      {link && link}
    </div>
    {desc && <div className='FontNormal'>{desc}</div>}
  </div>
)

type SectionTitleProps = {
  title: React.ReactNode
  className?: string
}

export const SectionTitle = ({ title, className }: SectionTitleProps) => (
  <div className={clsx('SectionTitle', className)}>
    <h2>{title}</h2>
  </div>
)

export const getLocalStorageData = () => {
  const balanceView = store.get(BALANCE_TABLE_VIEW)
  const showZeroBalances = store.get(BALANCE_SHOW_ZERO_BALANCES)
  const tableVariant = store.get(BALANCE_TABLE_VARIANT)

  return { balancesMode: tableVariant, showZeroBalances, balanceView }
}
