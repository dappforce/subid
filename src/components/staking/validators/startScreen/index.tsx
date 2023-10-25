import CommonDashboard from '../validatorStaking/CommonDashboard'
import styles from './Index.module.sass'
import { startWithUpperCase, PageTitle, getTokenSymbol } from '../../../utils/index'
import { MutedSpan } from '../../../utils/MutedText'
import { Space, Button } from 'antd'
import clsx from 'clsx'
import { useStakingContext, StakingStepsEnum } from '../contexts/StakingScreenContext'
import { useMemo } from 'react'
import { monthlyPercentage, yearlyPercentage } from '../valculateAPY'
import BN from 'bignumber.js'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useTranslation } from 'react-i18next'
import { useStakingInfo } from '../../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { useResponsiveSize } from '../../../responsive/ResponsiveContext'
import { useCalculatedUnstakingPeriod } from '../utils'

type StartScreenProps = {
  network: string
}

const useMonthlyPercentage = (network: string) => {
  const validatorStakingInfo = useStakingInfo(network)

  const { stakingInfo } = validatorStakingInfo || {}

  const { maxAPY } = stakingInfo || {}

  const monthlyAPY = useMemo(() => {
    if(!maxAPY) return <>-</>
    
    const percentage = monthlyPercentage({ maxAPY: new BN(maxAPY) }).multipliedBy(100).toFixed(2)

    return <>{percentage}%</>
  }, [ maxAPY ])

  return monthlyAPY
}

const useYearlyPercentage = (network: string) => {
  const validatorStakingInfo = useStakingInfo(network)

  const { stakingInfo } = validatorStakingInfo || {}

  const { maxAPY } = stakingInfo || {}

  const yearlyAPY = useMemo(() => {
    if(!maxAPY) return <>-</>
    
    const percentage = yearlyPercentage({ maxAPY: new BN(maxAPY) }).multipliedBy(100).toFixed(2)

    return <>{percentage}%</>
  }, [ maxAPY ])

  return yearlyAPY
}


const StartScreen = ({ network }: StartScreenProps) => {
  const { setCurrentStakingStep } = useStakingContext()
  const monthlyAPY = useMonthlyPercentage(network)
  const yearlyAPY = useYearlyPercentage(network)
  const chainsInfo = useChainInfo()
  const { isMobile } = useResponsiveSize()
  const { t } = useTranslation()
  const bondingDuration = useCalculatedUnstakingPeriod({ network })

  const { name } = chainsInfo?.[network] || {}
  const tokenSymbol = getTokenSymbol(network, chainsInfo)

  const backgroundImage = `/images/validators/${network}-start-screen-bg.png`

  return <div>
    <PageTitle 
      title={<>{startWithUpperCase(name)} {t('validatorStaking.title')}</>}
      desc={t('validatorStaking.subtitle', { bondingDuration: bondingDuration || '0' })}
    />
    <Space direction='vertical' size={24} className='w-100'>
      <CommonDashboard network={network} />
      <div className={styles.StartScreenSection} style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
        }}
      >
        <Space direction={'vertical'} size={24} className={clsx('text-center', { ['w-100']: isMobile })}>
          <h2>{t('validatorStaking.startScreen.estimatedEarnings', { symbol: tokenSymbol })}</h2>
          <div className={clsx('d-flex align-items-center', { ['flex-column']: isMobile })}>
            <div className={clsx(styles.EarningBlock, { ['bs-mb-4 w-100']: isMobile, ['bs-mr-3']: !isMobile })}>
              <MutedSpan>{t('validatorStaking.startScreen.monthly')}</MutedSpan>
              <div>{monthlyAPY}</div>
            </div>
            <div className={clsx(styles.EarningBlock, { ['w-100']: isMobile })}>
              <MutedSpan>{t('validatorStaking.startScreen.yearly')}</MutedSpan>
              <div>{yearlyAPY}</div>
            </div>
          </div>
          <Button 
            type='primary' 
            block 
            onClick={() => setCurrentStakingStep(StakingStepsEnum.Nominate)}
          >
            {t('validatorStaking.startScreen.button')}
          </Button>
        </Space>
      </div>
    </Space>
  </div>
}

export default StartScreen