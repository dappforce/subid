import { QuestionCircleOutlined } from '@ant-design/icons'
import { Col, Divider, Row, Tooltip } from 'antd'
import { MutedSpan } from '../utils/MutedText'
import styles from './Overview.module.sass'
import { useMyBalances } from '../providers/MyExtensionAccountsContext'
import { BalanceView } from '../homePage/address-views/utils/index'
import { useEffect, useState } from 'react'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { BIGNUMBER_ZERO } from '../../config/app/consts'

type TotalSectionProps = {
  title: string
  totalBalance: string
  description?: string
  withDivider?: boolean
  withMargin?: boolean
}

const TotalSection = ({ title, totalBalance, withDivider = true, withMargin = false, description }: TotalSectionProps) => {
  return <>
    <div className='d-flex justify-content-between'>
      <div className={styles.BalanceBlock}>
        <MutedSpan className={`${styles.FontSmall} ${!withMargin && isMobile ? 'mt-2' : ''}`}>
          {title}
          {description && <Tooltip className='ml-2' title={description}><QuestionCircleOutlined /></Tooltip>}
        </MutedSpan>

        <span className={`${styles.FontLarge} ${withMargin ? 'mb-2' : ''}`}>
          <BalanceView value={totalBalance.toString()} symbol='$' startWithSymbol />
        </span>
      </div>
      {withDivider && <Divider type='vertical' className='h-auto m-0' />}
    </div>
    {withMargin && <Divider type='horizontal' className='m-0' />}
  </>
}

export const Overview = () => {
  const { isMobile } = useResponsiveSize()
  const [ totalBalance, setTotalBalance ] = useState(BIGNUMBER_ZERO)
  const [ lockedBalance, setLockedBalance ] = useState(BIGNUMBER_ZERO)
  const { t } = useTranslation()
  const balances = useMyBalances()

  const {
    freeChainBalances,
    lockedChainBalances,
    lockedCrowdloanBalances,
    assetLockedBalance,
  } = balances

  const freeBalance = freeChainBalances
  const nonTransferableBalance = lockedChainBalances.plus(assetLockedBalance)

  useEffect(() => {
    const lockedBalancesValues = Object.values(lockedCrowdloanBalances)

    let balance = BIGNUMBER_ZERO
    lockedBalancesValues.map(value => balance = balance.plus(value))

    setLockedBalance(balance)
  }, [ JSON.stringify(lockedCrowdloanBalances) ])

  useEffect(() => {
    setTotalBalance(freeBalance.plus(nonTransferableBalance).plus(lockedBalance))
  }, [ freeBalance.toString(), nonTransferableBalance.toString(), lockedBalance.toString() ])

  const rows = [
    {
      title: t('overview.totalPortfolioValue.title'),
      balance: totalBalance,
      description: t('overview.totalPortfolioValue.description'),
    },
    {
      title: t('overview.transferableBalance.title'),
      balance: freeBalance,
      description: t('overview.transferableBalance.description')
    },
    {
      title: t('overview.nonTransferableBalance.title'),
      balance: nonTransferableBalance,
      description: t('overview.nonTransferableBalance.description')
    },
    {
      title: t('overview.lockedCrowdloans.title'),
      balance: lockedBalance,
      description: t('overview.lockedCrowdloans.description')
    }
  ]

  return <div className={`${styles.OverviewBlock} mb-4`}>
    <Row justify='space-between'>
      {rows?.map(({ title, balance, description }, index) => {
        return <Col key={index} span={isMobile ? 12 : 6}>
          <TotalSection
            title={title}
            totalBalance={balance.toFixed(2)}
            description={description}
            withDivider={isMobile ? index % 2 === 0 : index !== rows.length - 1}
            withMargin={isMobile && (index === 0 || index === 1)}
          />
        </Col>
      })}
    </Row>
  </div>
}
