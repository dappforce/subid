import { TableInfo } from '../types'
import styles from './BalancesCard.module.sass'
import { isEmptyArray } from '@subsocial/utils'
import clsx from 'clsx'
import React, { useState } from 'react'
import { AvatarOrSkeleton, Address } from '../utils'
import { BalanceView } from '@/components/homePage/address-views/utils'
import { Button, Divider } from 'antd'
import { NetworksIcons } from '../balancesTable/parseData/parseTokenCentricView'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { useTableContext } from '../customTable/TableContext'
import { useIsMulti } from '@/components/providers/MyExtensionAccountsContext'
import NoData from '@/components/utils/EmptyList'
import { PnlInDollars, calculatePnlInTokens } from '../balancesTable/utils'
import { MutedSpan } from '@/components/utils/MutedText'
import { usePrices } from '@/rtk/features/prices/pricesHooks'

type BalancesSectionCardProps<T extends TableInfo> = {
  value: T
  isLastElement?: boolean
}

const offsetByIndex = [ 0, 13, 63 ]

const collapseIconOffset = [ 0, 12, 10 ]

const BalancesSectionCard = <T extends TableInfo>({
  value,
  isLastElement,
}: BalancesSectionCardProps<T>) => {
  const [ open, setOpen ] = useState<boolean>(false)
  const balanceInfoRef = React.useRef<HTMLDivElement>(null)
  const prices = usePrices()
  const level = 0

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
    transferAction,
    showLinks,
  } = value

  const pnlData = calculatePnlInTokens({
    pricesData: prices,
    balanceValue,
    symbol,
  })

  const haveChildren = !!children || !isEmptyArray(children)

  const links = showLinks?.(!isMulti)

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
              {pnlData && (
                <div className='d-flex align-items-center justify-content-between lh-1'>
                  <MutedSpan>PnL 24h</MutedSpan>
                  <PnlInDollars balanceValue={balanceValue} symbol={symbol} />
                </div>
              )}

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
        <div className={styles.LinksButton}>{links || transferAction}</div>
      </div>
      {!isLastElement && (
        <div
          className={clsx(styles.CardDivider, {
            [styles.DividerOpenState]: haveChildren && open,
          })}
        >
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
          level={level + 1}
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
  level: number
}

const InnerChildrenBalances = <T extends TableInfo>({
  value,
  leftOffset,
  isLastElement,
  level,
}: InnerCildrenBalancesProps<T>) => {
  const [ open, setOpen ] = useState<boolean>(false)
  const { balancesVariant } = useTableContext()

  const {
    key,
    chain,
    balanceValue,
    totalValue,
    symbol,
    showLinks,
    children: innerChildren,
  } = value
  const childrenRowContentRef = React.useRef<HTMLDivElement>(null)
  const isMulti = useIsMulti()

  const links = showLinks?.(!isMulti)

  const haveChildren = !!innerChildren || !isEmptyArray(innerChildren)

  const tokenBalance = (
    <BalanceView value={balanceValue} decimalClassName={styles.TokenDecimals} />
  )

  const balanceInDollats = (
    <BalanceView value={totalValue} decimalClassName='GrayText' />
  )

  const childrenOffsetLeft = childrenRowContentRef.current?.offsetLeft || 0

  let childrenOffset = leftOffset + offsetByIndex[level]

  const isDetailedBalances = key.includes('detailed-balances')

  if (isDetailedBalances) {
    const chainCentricOffset = isMulti ? 62 : 11
    const tokenCentricOffset = isMulti ? 31 : 63

    childrenOffset =
      leftOffset +
      (balancesVariant === 'tokens' ? tokenCentricOffset : chainCentricOffset)
  }

  return (
    <div className={styles.InnerChildrenWrapper}>
      <div className={styles.ChildrenRow} onClick={() => setOpen(!open)}>
        <div
          className={styles.CollapseButton}
          style={{ width: childrenOffset }}
        >
          <div
            className={styles.InnerCollapseButton}
            style={{ paddingRight: collapseIconOffset[level] }}
          >
            {haveChildren && (
              <MdKeyboardArrowRight
                className={clsx(styles.ArrowRight, styles.InnerChildrenArrow, {
                  [styles.RotateArrow]: open && haveChildren,
                })}
              />
            )}
          </div>
        </div>
        <div
          key={key}
          ref={childrenRowContentRef}
          className={styles.ChildrenRowContent}
        >
          <span
            className={clsx(styles.ChidrenChainName, {
              [styles.DetailedBalances]: isDetailedBalances,
              [styles.ChainName]: !isDetailedBalances
            })}
          >
            {chain || symbol}
          </span>
          <div className={styles.ChildrenBalancesBlock}>
            <span className={styles.TokenBalance}>{tokenBalance}</span>
            <span className={styles.BalanceInDollars}>${balanceInDollats}</span>
          </div>
        </div>
        <div className={styles.LinksButton}>{links}</div>
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
          level={level + 1}
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
  level: number
}

const ChildrenBalances = <T extends TableInfo>({
  childrenBalances,
  className,
  leftOffset,
  level,
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
            level={level}
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
  noData,
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
