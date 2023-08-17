import AccountStakingDashboard from './AccountStakeDashboard'
import CommonDashboard from './CommonDashboard'
import { Space, Button, Alert } from 'antd'
import ActionsPannel from './ActionsPannel'
import { MutedDiv } from '../../../utils/MutedText'
import styles from './Index.module.sass'
import { 
  StakingDashboardContextWrapper, 
  useStakingDashboardContext, 
  StakingDashboardStepsEnum } from '../contexts/StakingDashboardContext'
import { ArrowLeftOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { ActionButton } from './modals/ActionModals'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { PageTitle, startWithUpperCase, getTokenSymbol, getTokenDecimals } from '../../../utils/index'
import { useNominatingStakingContext } from '../contexts/NominatingContext'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import BN from 'bn.js'
import { convertToBalanceWithDecimal } from '../../../common/balances/utils'
import { useTranslation } from 'react-i18next'
import { useStakingProps } from '../../../../rtk/features/validators/stakingProps/stakingPropsHooks'
import { useNominatorInfo } from '../../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'
import { SetValidators } from '../starNominating/SetValidators'
import { useCalculatedUnstakingPeriod } from '../utils'

type ChangeValidatorsScreenProps = {
  network: string
}

export const ChangeValidatorsScreen = ({ network }: ChangeValidatorsScreenProps) => {
  const { setCurrentStakingStep } = useStakingDashboardContext()
  const { selectedValidators } = useNominatingStakingContext() 
  const myAddress = useMyAddress()
  const chainsInfo = useChainInfo()
  const stakingProps = useStakingProps(network)
  const { info } = useNominatorInfo(network, myAddress)
  const { t } = useTranslation()

  const symbol = getTokenSymbol(network, chainsInfo)
  const decimals = getTokenDecimals(network, chainsInfo)
  
  const { minNominatorBond } = stakingProps || {}
  const { stakingLedger } = info || {}
  const { active } = stakingLedger || {}
  
  const minBond = minNominatorBond ? convertToBalanceWithDecimal(minNominatorBond, decimals).toString() : '0'

  const onBackClick = () => setCurrentStakingStep(StakingDashboardStepsEnum.Dashboard)

  const isBalanceLessThenMinBond = minNominatorBond?.toString() && active 
  ? new BN(active).lt(new BN(minNominatorBond)) 
  : undefined

  return <div className={styles.ChangeValidatorsScreen}>
    <div className='d-flex align-items-center'>
      <Button type='link' className={styles.BackArrow} onClick={onBackClick}>
        <ArrowLeftOutlined/>
      </Button>
      <h2 className={clsx(styles.PageTitle, 'bs-mb-0')}>{t('validatorStaking.changeValidatorsScreen.title')}</h2>
    </div>
    <MutedDiv className='bs-mb-4'>{t('validatorStaking.changeValidatorsScreen.desc')}</MutedDiv>
    {isBalanceLessThenMinBond && <Alert 
      message={<>
        You do not meet the minimum nominator stake of {minBond} {symbol}. 
        Please stake some funds before nominating.
      </>} 
      className='bs-mb-3'
      showIcon 
      type='warning' 
    />}
    <SetValidators network={network} />
    <Space size={16} direction='horizontal' className={clsx('d-flex align-items-center w-100', styles.ChangeValidatorsButtons)}>
      <Button type='primary' ghost block onClick={onBackClick}>{t('validatorStaking.backButton')}</Button>
      <ActionButton 
        network={network} 
        type='validators' 
        withFee={false} 
        label={t('validatorStaking.saveButton')} 
        disabled={isBalanceLessThenMinBond || !selectedValidators.length} 
      />
    </Space>
  </div>
}

type ValidatorsStakingSectionProps = {
  network: string
}

const InnerValidatorsStakingSection = ({ network }: ValidatorsStakingSectionProps) => {
  const { currentStakingStep } = useStakingDashboardContext()
  const chainsInfo = useChainInfo()
  const { t } = useTranslation()
  const bondingDuration = useCalculatedUnstakingPeriod({ network })

  const { name } = chainsInfo?.[network] || {}

  return currentStakingStep === StakingDashboardStepsEnum.Dashboard ? (
    <div>
      <PageTitle 
        title={<>{startWithUpperCase(name)} {t('validatorStaking.title')}</>} 
        desc={t('validatorStaking.subtitle', { bondingDuration: bondingDuration || '0' })}
      />
      <Space size={24} direction='vertical' className='w-100'>
        <CommonDashboard network={network} />
        <AccountStakingDashboard network={network}/>
        <ActionsPannel network={network} /> 
      </Space>
    </div> 
  ) : <ChangeValidatorsScreen network={network} />
}

const ValidatorsStakingSection = ({ network }: ValidatorsStakingSectionProps) => 
  <StakingDashboardContextWrapper network={network}>
    <InnerValidatorsStakingSection network={network} /> 
  </StakingDashboardContextWrapper>

export default ValidatorsStakingSection