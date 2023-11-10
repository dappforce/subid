import { QuestionCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { MutedSpan } from '../utils/MutedText'
import styles from './Index.module.sass'
import { useMyBalances } from '../providers/MyExtensionAccountsContext'
import { BalanceView } from '../homePage/address-views/utils/index'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BIGNUMBER_ZERO } from '../../config/app/consts'

type TotalSectionProps = {
  title: string
  totalBalance: string
  description?: string
  withDivider?: boolean
  withMargin?: boolean
}

const TotalSection = ({
  title,
  totalBalance,
  description,
}: TotalSectionProps) => {
  return (
    <>
      <div className={styles.BalanceBlock}>
        <MutedSpan className={styles.FontSmall}>
          {title}
          {description && (
            <Tooltip className='ml-2' title={description}>
              <QuestionCircleOutlined />
            </Tooltip>
          )}
        </MutedSpan>

        <BalanceView
          value={totalBalance.toString()}
          symbol='$'
          startWithSymbol
          className={styles.FontLarge}
        />
      </div>
    </>
  )
}

export const AccountDashboard = () => {
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
    lockedBalancesValues.forEach((value) => (balance = balance.plus(value)))

    setLockedBalance(balance)
  }, [ JSON.stringify(lockedCrowdloanBalances) ])

  useEffect(() => {
    setTotalBalance(
      freeBalance.plus(nonTransferableBalance).plus(lockedBalance)
    )
  }, [
    freeBalance.toString(),
    nonTransferableBalance.toString(),
    lockedBalance.toString(),
  ])

  const rows = [
    {
      title: t('overview.totalPortfolioValue.title'),
      balance: totalBalance,
      description: t('overview.totalPortfolioValue.description'),
    },
    {
      title: t('overview.transferableBalance.title'),
      balance: freeBalance,
      description: t('overview.transferableBalance.description'),
    },
    {
      title: t('overview.nonTransferableBalance.title'),
      balance: nonTransferableBalance,
      description: t('overview.nonTransferableBalance.description'),
    },
    {
      title: t('overview.lockedCrowdloans.title'),
      balance: lockedBalance,
      description: t('overview.lockedCrowdloans.description'),
    },
  ]

  const dashboardItems = rows?.map(({ title, balance, description }, index) => {
    return (
      <TotalSection
        key={index}
        title={title}
        totalBalance={balance.toFixed(2)}
        description={description}
      />
    )
  })

  return <div className={styles.OverviewBlock}>{dashboardItems}</div>
}
