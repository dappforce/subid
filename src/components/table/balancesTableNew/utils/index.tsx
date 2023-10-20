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

type LabelWithIconProps = {
  label: string
  iconSrc: string | React.ReactNode
}

const LabelWithIcon = ({ label, iconSrc }: LabelWithIconProps) => {
  return (
    <div className={'d-flex align-items-center'}>
      <div className={clsx(styles.IconCircle, 'bs-mr-2')}>
        {typeof iconSrc === 'string' ? (
          <Image src={iconSrc} alt='' height={14} width={14} />
        ) : (
          iconSrc
        )}
      </div>
      {label}
    </div>
  )
}

export const balanceVariantsOpt = [
  {
    label: (
      <LabelWithIcon
        label={'Chain-centric'}
        iconSrc={'/images/icons/chain-centric.svg'}
      />
    ),
    key: 'chains',
  },
  {
    label: (
      <LabelWithIcon
        label={'Tokens-centric'}
        iconSrc={'/images/icons/token-centric.svg'}
      />
    ),
    key: 'tokens',
  },
]

export const balancesViewOpt = [
  {
    label: <LabelWithIcon iconSrc={<MenuOutlined />} label={'Table'} />,
    key: 'table',
  },
  {
    label: <LabelWithIcon iconSrc={<AppstoreOutlined />} label={'Cards'} />,
    key: 'cards',
  },
  {
    label: <LabelWithIcon iconSrc={<LineChartOutlined />} label={'Chart'} />,
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
