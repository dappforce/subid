import {
  BalanceCardProps,
  BalanceCardsProps,
  ChildrenBalances,
  ChildrenBalancesProps,
} from '.'
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

const BalancesSectionCard = <T extends TableInfo>({
  value,
}: BalanceCardProps<T>) => {
  const [open, setOpen] = useState<boolean>(false)
  let level = 0

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

  return (
    <div className={styles.CardWrapper}>
      <div className={styles.Card} onClick={() => setOpen(!open)}>
        <AvatarOrSkeleton
          icon={icon}
          size={'small'}
          className='bs-mr-2 align-items-start flex-shrink-none'
        />
        <div className={styles.BalanceInfo}>
          <div className={styles.TopPart}>
            <div>{chainPart}</div>
            <div className={clsx(styles.TopPartBlock, 'text-right')}>
              <span className={styles.TokenBalance}>{balanceView}</span>
              <span className={styles.BalanceInDollars}>
                ${balanceInDollars}
              </span>
            </div>
          </div>
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
                <Address accountId={address} withCopy withQr halfLength={5} />
              )}
              {networkIcons && (
                <NetworksIcons networkIcons={networkIcons} withCounter />
              )}
              <Button size='small'>
                Details{' '}
                <MdKeyboardArrowRight
                  className={clsx(styles.ArrowRight, {
                    [styles.RotateArrow]: open && haveChildren,
                  })}
                />
              </Button>
            </div>
          </div>
        </div>
        <div className={styles.LinksButton}>{links}</div>
      </div>
      <div className={styles.CardDivider}>
        <Divider />
      </div>
      <div
        className={clsx(styles.CollapseWrapper, {
          [styles.OpenCollapse]: open && haveChildren,
        })}
      >
        <ChildrenBalancesNew
          name={name as string}
          childrenBalances={children as T[]}
          level={level + 1}
          balanceKind={'NativeToken'}
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

const ChildrenBalancesNew = <T extends TableInfo>({
  childrenBalances,
  className,
  level
}: ChildrenBalancesProps<T>) => {
  return (
    <div className={clsx(styles.ChildrenWrapper, className)}>
      {childrenBalances?.map((children) => {
        const {
          key,
          chain,
          balanceValue,
          name,
          totalValue,
          children: innerChildren,
        } = children

        const tokenBalance = (
          <BalanceView
            value={balanceValue}
            decimalClassName={styles.TokenDecimals}
          />
        )

        const balanceInDollats = (
          <BalanceView value={totalValue} decimalClassName='GrayText' />
        )

        return (
          <>
            <div key={key} className={styles.ChildrenRow}>
              <span className={styles.ChidrenChainName}>{chain}</span>
              <div className={styles.ChildrenBalancesBlock}>
                <span className={styles.TokenBalance}>{tokenBalance}</span>
                <span className={styles.BalanceInDollars}>
                  ${balanceInDollats}
                </span>
              </div>
            </div>
            <ChildrenBalancesNew
              name={name as string}
              childrenBalances={innerChildren as T[]}
              level={level + 1}
              balanceKind={'NativeToken'}
              className={clsx(styles.ChildrenBalances)}
            />
          </>
        )
      })}
    </div>
  )
}

const BalancesSectionCards = <T extends TableInfo>({
  data,
  balanceKind,
}: BalanceCardsProps<T>) => {
  return (
    <div>
      {data.map((value, index) => {
        return (
          <BalancesSectionCard
            key={index}
            value={value}
            balanceKind={balanceKind}
            isLastElement={index === data.length - 1}
          />
        )
      })}
    </div>
  )
}

export default BalancesSectionCards
