import { TableInfo } from '../types'
import styles from './BalancesCard.module.sass'
import { isEmptyArray } from '@subsocial/utils'
import clsx from 'clsx'
import React, { useState } from 'react'
import { AvatarOrSkeleton, Address } from '../utils'
import { BalanceView } from '@/components/homePage/address-views/utils'
import { PnlData } from '../balancesTable/utils/index'
import { Button, Divider } from 'antd'
import { NetworksIcons } from '../balancesTable/parseData/parseTokenCentricView'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { useTableContext } from '../customTable/TableContext'
import { useIsMulti } from '@/components/providers/MyExtensionAccountsContext'
import NoData from '@/components/utils/EmptyList'

type BalancesSectionCardProps<T extends TableInfo> = {
  value: T
  isLastElement?: boolean
}

const BalancesSectionCard = <T extends TableInfo>({
  value,
  isLastElement,
}: BalancesSectionCardProps<T>) => {
  const [open, setOpen] = useState<boolean>(false)
  const balanceInfoRef = React.useRef<HTMLDivElement>(null)

  const isMulti = useIsMulti()

  const {
    address,
    icon,
    name,
    symbol,
    balanceValue,
    totalValue,
    children,
    networkIcons,
    showLinks,
  } = value

  const haveChildren = !!children || !isEmptyArray(children)

  const links = showLinks?.(true)

  const balanceView = (
    <BalanceView value={balanceValue} decimalClassName={styles.TokenDecimals} />
  )
  const balanceInDollars = (
    <BalanceView value={totalValue} decimalClassName='GrayText' />
  )

  const chainPart = (
    <div className='d-flex align-items-start'>
      <div className={styles.TopPartBlock}>
        <span className={clsx(styles.RowTitle, 'font-weight-semibold lh-1')}>
          {name}
        </span>
        <span className={styles.RowDesc}>{symbol}</span>
      </div>
    </div>
  )

  const showBottomPart =
    !!address ||
    (networkIcons && !isEmptyArray(networkIcons)) ||
    !balanceValue.isZero()

  return (
    <div className={styles.CardWrapper}>
      <div
        className={styles.Card}
        onClick={() => haveChildren && setOpen(!open)}
      >
        <AvatarOrSkeleton
          icon={icon}
          size={'small'}
          className='bs-mr-2 align-items-start flex-shrink-none'
        />
        <div ref={balanceInfoRef} className={styles.BalanceInfo}>
          <div className={styles.TopPart}>
            <div>{chainPart}</div>
            <div className={clsx(styles.TopPartBlock, 'text-right')}>
              <span className={styles.TokenBalance}>{balanceView}</span>
              <span className={styles.BalanceInDollars}>
                ${balanceInDollars}
              </span>
            </div>
          </div>
          {showBottomPart && (
            <div className={styles.BottomPart}>
              <PnlData
                balanceValue={balanceValue}
                symbol={symbol}
                className={
                  'd-flex align-items-center justify-content-between lh-1'
                }
              />

              <div className='d-flex align-items-center justify-content-between'>
                {address && (
                  <Address
                    accountId={address}
                    withCopy={!isMulti}
                    withQr={!isMulti}
                    halfLength={5}
                  />
                )}
                {networkIcons && !isEmptyArray(networkIcons) && (
                  <NetworksIcons networkIcons={networkIcons} withCounter />
                )}
                {haveChildren && (
                  <Button size='small'>
                    Details{' '}
                    <MdKeyboardArrowRight
                      className={clsx(styles.ArrowRight, {
                        [styles.RotateArrow]: open && haveChildren,
                      })}
                    />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.LinksButton}>{links}</div>
      </div>
      {!isLastElement && (
        <div className={styles.CardDivider}>
          <Divider />
        </div>
      )}
      <div
        className={clsx(styles.CollapseWrapper, styles.CollapseWrapperPadding, {
          [styles.OpenCollapse]: open && haveChildren,
        })}
      >
        <ChildrenBalances
          childrenBalances={children as T[]}
          leftOffset={(balanceInfoRef.current as any)?.offsetLeft}
          className={clsx(styles.ChildrenBalances)}
        />
      </div>
      {open && haveChildren && (
        <div className={styles.InnerCardDivider}>
          <Divider />
        </div>
      )}
    </div>
  )
}

type InnerCildrenBalancesProps<T extends TableInfo> = {
  value: T
  className?: string
  leftOffset: number
  isLastElement?: boolean
}

const InnerChildrenBalances = <T extends TableInfo>({
  value,
  leftOffset,
  isLastElement,
}: InnerCildrenBalancesProps<T>) => {
  const [open, setOpen] = useState<boolean>(false)
  const { balancesVariant } = useTableContext()

  const {
    key,
    chain,
    balanceValue,
    totalValue,
    children: innerChildren,
  } = value
  const childrenRowContentRef = React.useRef<HTMLDivElement>(null)
  const isMulti = useIsMulti()

  const haveChildren = !!innerChildren || !isEmptyArray(innerChildren)

  const tokenBalance = (
    <BalanceView value={balanceValue} decimalClassName={styles.TokenDecimals} />
  )

  const balanceInDollats = (
    <BalanceView value={totalValue} decimalClassName='GrayText' />
  )

  const childrenOffsetLeft = childrenRowContentRef.current?.offsetLeft || 0

  let childrenOffset = ['reserved', 'locked', 'free'].includes(key)
    ? leftOffset + (balancesVariant === 'tokens' || isMulti ? 56 : 8)
    : leftOffset + 7

  return (
    <div className={styles.InnerChildrenWrapper}>
      <div className={styles.ChildrenRow}>
        <div
          className={styles.CollapseButton}
          style={{ width: childrenOffset }}
        >
          {haveChildren && (
            <MdKeyboardArrowRight
              className={clsx(styles.ArrowRight, styles.InnerChildrenArrow, {
                [styles.RotateArrow]: open && haveChildren,
              })}
            />
          )}
        </div>
        <div
          key={key}
          ref={childrenRowContentRef}
          className={styles.ChildrenRowContent}
          onClick={() => setOpen(!open)}
        >
          <span className={styles.ChidrenChainName}>{chain}</span>
          <div className={styles.ChildrenBalancesBlock}>
            <span className={styles.TokenBalance}>{tokenBalance}</span>
            <span className={styles.BalanceInDollars}>${balanceInDollats}</span>
          </div>
        </div>
      </div>
      <div
        className={clsx(styles.CollapseWrapper, {
          [styles.OpenCollapse]: open && haveChildren,
        })}
      >
        <ChildrenBalances
          childrenBalances={innerChildren as T[]}
          leftOffset={childrenOffsetLeft}
          className={clsx(styles.ChildrenBalances)}
        />
      </div>
      {haveChildren && !isLastElement && open && (
        <div className={clsx(styles.CardDivider, 'mt-3')}>
          <Divider />
        </div>
      )}
    </div>
  )
}

type ChildrenBalancesProps<T extends TableInfo> = {
  childrenBalances: T[]
  className?: string
  leftOffset: number
}

const ChildrenBalances = <T extends TableInfo>({
  childrenBalances,
  className,
  leftOffset,
}: ChildrenBalancesProps<T>) => {
  return (
    <div className={clsx(styles.ChildrenWrapper, className)}>
      {childrenBalances?.map((children, i) => {
        return (
          <InnerChildrenBalances
            key={i}
            value={children}
            leftOffset={leftOffset}
            className={styles.ChildrenBalances}
            isLastElement={i === childrenBalances.length - 1}
          />
        )
      })}
    </div>
  )
}

type BalanceCardsProps<T extends TableInfo> = {
  data: T[]
  noData: React.ReactNode
}

const BalancesSectionCards = <T extends TableInfo>({
  data,
  noData
}: BalanceCardsProps<T>) => {
  if (isEmptyArray(data)) return <NoData description={noData} />

  return (
    <div>
      {data.map((value, index) => {
        return (
          <BalancesSectionCard
            key={index}
            value={value}
            isLastElement={index === data.length - 1}
          />
        )
      })}
    </div>
  )
}

export default BalancesSectionCards
