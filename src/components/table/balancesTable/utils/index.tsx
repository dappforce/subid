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

export const getBalancePart = (balance: JSX.Element, withMargin?: boolean) => (
  <div className={clsx('d-grid', withMargin && 'bs-mr-4')}>{balance}</div>
)

export const encodeTokenId = (address: string, tokenId: string) => `${address}-and-${tokenId}`

export const decodeTokenId = (tokenId: string) => {
  const [ address, id ] = tokenId.split('-and-')
  return { address, id }
}

type LabelWithIconProps = {
  label: string
  iconSrc: string | React.ReactNode
}

const LabelWithIcon = ({ label, iconSrc }: LabelWithIconProps) => {
  return (
    <div className={'d-flex align-items-center'}>
      <div className={clsx(styles.IconCircle, 'bs-mr-2')}>
        {typeof iconSrc === 'string' ? (
          <Image src={iconSrc} alt='' height={16} width={16} />
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
      <LabelWithIcon
        label={'Chain-centric'}
        iconSrc={<ChainCentricIcon />}
      />
    ),
    key: 'chains',
  },
  {
    label: (
      <LabelWithIcon
        label={'Tokens-centric'}
        iconSrc={<TokenCentricIcon />}
      />
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
    label: <LabelWithIcon iconSrc={<MenuOutlined width={16} />} label={'Table'} />,
    key: 'table',
  },
  {
    label: <LabelWithIcon iconSrc={<AppstoreOutlined width={16} />} label={'Cards'} />,
    key: 'cards',
  },
  {
    label: <LabelWithIcon iconSrc={<LineChartOutlined width={16} />} label={'Chart'} />,
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
