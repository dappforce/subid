import { isEmptyArray } from '@subsocial/utils'
import { Card, Col, Divider, Row } from 'antd'
import NoData from '../../utils/EmptyList'
import styles from '../Table.module.sass'
import { ChainData } from '../utils'
import { BalanceKind, TableInfo } from '../types'
import { useState } from 'react'
import { UpOutlined, DownOutlined } from '@ant-design/icons'
import { MutedDiv } from '../../utils/MutedText'
import clsx from 'clsx'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import { useIsMulti } from '../../providers/MyExtensionAccountsContext'
import CardAdditionalView from './CardAdditionalView'

export type BalanceCardProps<T> = {
  value: T
  balanceKind: BalanceKind
  isLastElement?: boolean
}

const CustomCard = <T extends TableInfo>({
  value,
  balanceKind,
  isLastElement
}: BalanceCardProps<T>) => {
  const [ open, setOpen ] = useState<boolean>(false)
  const { isMobile } = useResponsiveSize()
  const isMulti = useIsMulti()

  const {
    key,
    address,
    icon,
    name,
    balanceWithoutChildren,
    balance,
    total,
    totalValue,
    status,
    children,
    cardChildren,
    showLinks,
  } = value

  const haveChildren = children || cardChildren

  const links = showLinks?.(true)

  return (
    <Col key={key} className={styles.DfCol}>
      <Card
        key={key}
        className={clsx(styles.Card, {
          [styles.Selectable]: haveChildren,
          [styles.isExpandedCard]: isMobile && haveChildren && open,
        })}
        hoverable={!isMobile}
        bordered={!isMobile}
        onClick={() => setOpen(!open)}
      >
        <div>
          <div className={styles.CardContent}>
            <ChainData
              name={name as string}
              accountId={address}
              isShortAddress
              withCopy={!isMulti && balanceKind !== 'StatemineAsset'}
              isMonosizedFont={!isMulti}
              avatarSize={isMobile ? 'small' : 'large'}
              icon={icon}
              halfLength={isMobile ? 5 : 6}
              withQr={!isMobile}
            />
            <div className='text-right'>
              <div className='d-flex align-items-center'>
                <div>
                  <div className='FontNormal'>
                    {totalValue ? balanceWithoutChildren || balance : status}
                  </div>
                  <div>
                    <MutedDiv>{total}</MutedDiv>
                  </div>
                </div>
                {haveChildren && (
                  <MutedDiv className='ml-2 align-self-center'>
                    {open ? <UpOutlined /> : <DownOutlined />}
                  </MutedDiv>
                )}
                {links && <div className='ml-1'>{links}</div>}
              </div>
            </div>
          </div>
          {isMobile && (!isLastElement || open) && <Divider className={clsx(styles.CardDivider, 'MarginTopTiny')} />}

          {open &&
            (children ? (
              <ChildrenBalances
                name={name as string}
                childrenBalances={children as T[]}
              />
            ) : (
              <CardAdditionalView {...cardChildren} />
            ))}
        </div>
      </Card>
    </Col>
  )
}

export type BalanceCardsProps<T> = {
  data: T[]
  balanceKind: BalanceKind
  isMobile: boolean
  noData: string
}

export const BalanceCards = <T extends TableInfo>({
  data,
  noData,
  balanceKind,
}: BalanceCardsProps<T>) => {
  if (isEmptyArray(data)) return <NoData description={noData} />

  return (
    <Row className={clsx(styles.DfGridParams)}>
      {data.map((value: T, index) => {
        const isLastElement = index === data.length - 1
        return <CustomCard key={index} value={value} balanceKind={balanceKind} isLastElement={isLastElement} />
      })}
    </Row>
  )
}

type ChildrenBalancesProps<T> = {
  name: string
  childrenBalances: T[]
  isSecondLevel?: boolean
}

type InnerChildrenBalancesProps<T> = {
  name: string
  child: T
  isMulti?: boolean
  isMobile: boolean
  index: number
  className?: string
}

const balanceColumnClasses =
  'text-right d-flex align-items-center justify-content-end'

const InnerChildrenBalances = <T extends TableInfo>({
  name,
  child,
  isMobile,
  className,
}: InnerChildrenBalancesProps<T>) => {
  const [ open, setOpen ] = useState<boolean>(false)
  const haveChildren = child?.children || child.cardChildren

  const balances = (
    <>
      <Col className={clsx(balanceColumnClasses, styles.CardViewBalance)}>
        {child.balanceWithoutChildren || child.balance}
      </Col>
      <Col className={clsx({ ['mr-1']: !haveChildren }, balanceColumnClasses)}>
        <MutedDiv>{child.total}</MutedDiv>
      </Col>
    </>
  )

  const balanceColumn = (
    <div className={clsx('d-flex flex-column')}>{balances}</div>
  )

  const onSectionClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()

    setOpen(!open)
  }

  return (
    <>
      <Row
        key={`${name}-${child.key}`}
        className={clsx(className, 'mt-2')}
        justify='space-between'
        onClick={haveChildren && onSectionClick}
      >
        <Col span={13}>{child.chain}</Col>
        {haveChildren ? (
          <div className={clsx({ ['d-flex']: haveChildren })}>
            {balanceColumn}
            <MutedDiv
              className={clsx('ml-2', { ['align-self-center']: !isMobile })}
            >
              {open ? <UpOutlined /> : <DownOutlined />}
            </MutedDiv>
          </div>
        ) : (
          balanceColumn
        )}
      </Row>

      {haveChildren &&
        open &&
        (child.children ? (
          <ChildrenBalances
            name={name}
            childrenBalances={haveChildren as T[]}
            isSecondLevel
          />
        ) : (
          <CardAdditionalView {...child.cardChildren} />
        ))}
    </>
  )
}

const ChildrenBalances = <T extends TableInfo>({
  childrenBalances,
  name,
  isSecondLevel = false,
}: ChildrenBalancesProps<T>) => {
  const { isMobile } = useResponsiveSize()
  const isMulti = useIsMulti()

  const balances = childrenBalances.map((child, index) => {
    const isLastElement = index === childrenBalances.length - 1

    return (
      <>
        <InnerChildrenBalances
          key={`${index}-${name}`}
          index={index}
          child={child}
          isMobile={isMobile}
          name={name}
          isMulti={isMulti}
          className={clsx(
            { ['mb-2']: isMobile && isLastElement },
            'MarginLeftHuge'
          )}
        />

        {((isLastElement && isSecondLevel) ||
          (child.key === 'frozen' && !isLastElement)) && (
          <Divider className={styles.CardDivider} />
        )}
      </>
    )
  })

  return (
    <>
      <div key={name} className={styles.ChildrenBalance}>
        {balances}
      </div>
    </>
  )
}
