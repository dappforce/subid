import { BalancesTableInfo } from '../../types'
import BN from 'bignumber.js'
import { fieldSkeleton } from '../../utils'
import { isEmptyArray } from '@subsocial/utils'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import Image from 'next/image'
import styles from './Index.module.sass'
import clsx from 'clsx'
import {
  AppstoreOutlined,
  LineChartOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import TokenCentricIcon from '@/assets/icons/token-centric.svg'
import ChainCentricIcon from '@/assets/icons/chain-centric.svg'
import store from 'store'
import { AccountInfoItem } from '@/components/identity/types'
import { BalanceEntityRecord } from '@/rtk/features/balances/balancesSlice'
import { usePrices } from '@/rtk/features/prices/pricesHooks'

export const allowedTokensByNetwork: Record<string, string[]> = {
  statemine: [
    'BTC',
    'CHAOS',
    'USDC',
    'USDT',
    'CHRWNA',
    'RMRK',
    'KSM',
    'BILL',
    'KODA',
    'SHIB',
  ],
  parallel: [
    'INTR',
    'ACA',
    'DOT',
    'IBTC',
    'AUSD',
    'USDT',
    'GLMR',
    'CLV',
    'ASTR',
    'PHA',
    'PARA',
  ],
  statemint: [ 'WETH', 'WBTC', 'BTC', 'DOT', 'USDC', 'USDT', 'BUSD' ],
}

const BALANCES_KEY = 'balances'

export const getBalancesFromStore = () => store.get(BALANCES_KEY)

export const setBalancesToStore = (
  address: string,
  balances?: AccountInfoItem[]
) => {
  const balancesFromStore = getBalancesFromStore()

  balances &&
    store.set(BALANCES_KEY, {
      ...balancesFromStore,
      [address]: balances,
    })
}

export const getBalancesFromStoreByAddresses = (addresses: string[]) => {
  const balancesFromStore = getBalancesFromStore()

  const entity: Record<string, { balances: AccountInfoItem[] }> = {}

  addresses.forEach(
    (address) => (entity[address] = { balances: balancesFromStore?.[address] })
  )

  return entity as BalanceEntityRecord
}

export const getBalancePart = (balance: JSX.Element, withMargin?: boolean) => (
  <div className={clsx('d-grid', withMargin && 'bs-mr-4')}>{balance}</div>
)

export const encodeTokenId = (address: string, tokenId: string) =>
  `${address}-and-${tokenId}`

export const decodeTokenId = (tokenId: string) => {
  const [ address, id ] = tokenId.split('-and-')
  return { address, id }
}

type LabelWithIconProps = {
  label: string
  iconSrc: string | React.ReactNode
  iconSize?: number
  iconClassName?: string
}

export const LabelWithIcon = ({ label, iconSrc, iconSize = 16, iconClassName }: LabelWithIconProps) => {
  return (
    <div className={'d-flex align-items-center'}>
      <div className={clsx(styles.IconCircle, iconClassName, 'bs-mr-2')}>
        {typeof iconSrc === 'string' ? (
          <Image src={iconSrc} alt='' className={styles.IconInLabel} height={iconSize} width={iconSize} />
        ) : (
          iconSrc
        )}
      </div>
      {label}
    </div>
  )
}

export const balanceVariantsWithIconOpt = [
  {
    label: (
      <LabelWithIcon label={'Chain-centric'} iconSrc={<ChainCentricIcon />} />
    ),
    key: 'chains',
  },
  {
    label: (
      <LabelWithIcon label={'Tokens-centric'} iconSrc={<TokenCentricIcon />} />
    ),
    key: 'tokens',
  },
]

export const balanceVariantsOpt = [
  { label: 'Chains', value: 'chains' },
  { label: 'Tokens', value: 'tokens' },
]

export const balancesViewOpt = [
  {
    label: (
      <LabelWithIcon iconSrc={<MenuOutlined width={16} />} label={'Table'} />
    ),
    key: 'table',
  },
  {
    label: (
      <LabelWithIcon
        iconSrc={<AppstoreOutlined width={16} />}
        label={'Cards'}
      />
    ),
    key: 'cards',
  },
  {
    label: (
      <LabelWithIcon
        iconSrc={<LineChartOutlined width={16} />}
        label={'Chart'}
      />
    ),
    key: 'pie',
  },
]

const getFreeAndLockedBalanceFromChildren = (
  children?: Partial<BalancesTableInfo>[]
) => {
  let freeBalance = BIGNUMBER_ZERO
  let lockedBalance = BIGNUMBER_ZERO

  children?.forEach((childrenInfo) => {
    switch (childrenInfo.key) {
      case 'reserved':
      case 'locked':
        lockedBalance = lockedBalance.plus(
          childrenInfo?.totalValue || BIGNUMBER_ZERO
        )
        break
      case 'frozen':
        break
      default:
        freeBalance = freeBalance.plus(
          childrenInfo?.totalValue || BIGNUMBER_ZERO
        )
        break
    }
  })

  return { freeBalance, lockedBalance }
}

export const calculateChildrenBalances = (
  freeChainBalances: BN,
  lockedChainBalances: BN,
  childrenBalance?: Partial<BalancesTableInfo>[]
) => {
  const { freeBalance, lockedBalance } =
    getFreeAndLockedBalanceFromChildren(childrenBalance)

  return {
    freeCalculatedBalance: freeChainBalances.plus(freeBalance),
    lockedCalculatedBalance: lockedChainBalances.plus(lockedBalance),
  }
}

export const createFieldSkeletons = (data?: BalancesTableInfo[]) => {
  if (!data) return []

  return data.map((item) => {
    item.balanceWithoutChildren = fieldSkeleton
    item.balance = fieldSkeleton
    item.price = fieldSkeleton
    item.total = fieldSkeleton

    if (item.children && !isEmptyArray(item.children)) {
      item.children = item.children.map((child) => {
        child.balance = fieldSkeleton
        child.total = fieldSkeleton
        child.price = fieldSkeleton

        return child
      })
    }

    return item
  })
}
// 55894.3459
// 0,010318590723302
// 576,7508790888
// 36,2181209112
type PnlDataProps = {
  symbol: string
  balanceValue: BN
}

export const PnlData = ({ symbol, balanceValue }: PnlDataProps) => {
  const prices = usePrices()

  const priceObjBySymbol = prices?.find(item => item.symbol.toLowerCase() === symbol.toLowerCase())

  if(!priceObjBySymbol) return null

  const { current_price, price_change_percentage_24h } = priceObjBySymbol

  const priceChange24h = new BN(price_change_percentage_24h)

  const price24hAgo = new BN(current_price).dividedBy(new BN(1).minus(priceChange24h.dividedBy(100)))

  console.log(symbol)
  console.log('price_change_percentage_24h', price_change_percentage_24h)
  console.log('Current price', current_price)
  console.log('Price 24h', price24hAgo.toString())

  const balance24hAgo = balanceValue.multipliedBy(price24hAgo)
  const currentBalance = balanceValue.multipliedBy(current_price)

  const pnl = currentBalance.minus(balance24hAgo)

  return <>
    Pnl 24h: {pnl.toFixed(4)}
  </>
}
