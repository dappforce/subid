import { Divider, Col, Row } from 'antd'
import { useResponsiveSize } from '../../../responsive/ResponsiveContext'
import { MutedSpan, MutedDiv } from '../../../utils/MutedText'
import styles from './Index.module.sass'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { convertToBalanceWithDecimal } from '../../../common/balances/utils'
import { BalanceView } from '../../../homePage/address-views/utils/index'
import { useTranslation } from 'react-i18next'
import { useCalculatedUnstakingPeriod } from '../utils'
import { useStakingInfo } from '../../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { useStakingProps } from '../../../../rtk/features/validators/stakingProps/stakingPropsHooks'
import { BIGNUMBER_ZERO } from '../../../../config/app/consts'
import { getTokenDecimals, getTokenSymbol } from '../../../utils/index'

type DashboardItemProps = {
  title: string
  desc: React.ReactNode
  withDivider?: boolean
  withMargin?: boolean
}

const DashboardItem = ({
  title,
  desc,
  withDivider = true,
  withMargin = false,
}: DashboardItemProps) => {
  const { isMobile } = useResponsiveSize()

  return (
    <>
      <div className='d-flex justify-content-between'>
        <div className={styles.DashboardItem}>
          <MutedSpan
            className={`${styles.CommonDashboardTitle} ${
              !withMargin && isMobile ? 'bs-mt-2' : ''
            }`}
          >
            {title}
          </MutedSpan>

          <span className={`${styles.CommonDashboardValue} ${withMargin ? 'bs-mb-2' : ''}`}>
            {desc}
          </span>
        </div>
        {withDivider && <Divider type='vertical' className='h-auto m-0' />}
      </div>
      {withMargin && <Divider type='horizontal' className='m-0' />}
    </>
  )
}

const MUTED_DASH = <MutedDiv>-</MutedDiv>

type CommonDashboardProps = {
  network: string
}

const CommonDashboard = ({ network }: CommonDashboardProps) => {
  const { isMobile } = useResponsiveSize()
  const { stakingInfo } = useStakingInfo(network) || {}
  const { minNominatorBond } = useStakingProps(network) || {}
  const chainsInfo = useChainInfo()
  const { t } = useTranslation()
  const calculatedUnstakingPeriod = useCalculatedUnstakingPeriod({ network })

  const { nominators, era } = stakingInfo || {}

  const decimals = getTokenDecimals(network, chainsInfo)
  const symbol = getTokenSymbol(network, chainsInfo)

  const minBondValue = minNominatorBond ? convertToBalanceWithDecimal(minNominatorBond, decimals) : BIGNUMBER_ZERO

  const minBond = <BalanceView value={minBondValue} symbol={symbol}/>

  const rows = [
    {
      title: t('validatorStaking.commonDashboard.minimumStake'),
      desc: minBond,
    },
    {
      title: t('validatorStaking.commonDashboard.unstakingPeriod'),
      desc: calculatedUnstakingPeriod || MUTED_DASH,
    },
    {
      title: t('validatorStaking.commonDashboard.activeNominators'),
      desc: nominators?.length ?? MUTED_DASH,
    },
    {
      title: t('validatorStaking.commonDashboard.activeEra'),
      desc: era ?? MUTED_DASH,
    },
  ]

  return (
    <div className={styles.DashboardBlock}>
      <Row justify='space-between'>
        {rows?.map(({ title, desc }, index) => {
          return (
            <Col key={index} span={isMobile ? 12 : 6}>
              <DashboardItem
                title={title}
                desc={desc}
                withDivider={
                  isMobile ? index % 2 === 0 : index !== rows.length - 1
                }
                withMargin={isMobile && (index === 0 || index === 1)}
              />
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

export default CommonDashboard
