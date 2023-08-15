import { ExclamationCircleFilled, RightOutlined } from '@ant-design/icons'
import styles from './Index.module.sass'
import { Space } from 'antd'
import { MutedDiv } from '../../../utils/MutedText'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import clsx from 'clsx'
import { convertToBalanceWithDecimal } from 'src/components/common/balances'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import BN from 'bignumber.js'
import { BalanceView } from 'src/components/homePage/address-views/utils'
import UnstakeAndStakeMoreModal from './modals/StakeMoreModal'
import { useMemo, useState } from 'react'
import { toGenericAccountId } from '../../../../rtk/app/util'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { ValidatorInfo } from '../../../../rtk/features/validators/stakingInfo/types'
import { PriceView, getTokenDecimals, getTokenSymbol } from '../../../utils/index'
import { useStakingDashboardContext, StakingDashboardStepsEnum } from '../contexts/StakingDashboardContext'
import { useTranslation } from 'react-i18next'
import { useStakingInfo } from '../../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { useNominatorInfo } from '../../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'
import { useStakingProps } from '../../../../rtk/features/validators/stakingProps/stakingPropsHooks'
import { useResponsiveSize } from '../../../responsive/ResponsiveContext'
import { BIGNUMBER_ZERO, BIGNUMBER_ONE } from '../../../../config/app/consts'

type AlertMessageProps = {
  network: string
  title: React.ReactNode
  desc?: React.ReactNode
  action?: () => void
}

const AlertMessage = ({ title, desc, action }: AlertMessageProps) => {
  const { isMobile } = useResponsiveSize()

  return <div 
    className={clsx(
      styles.AlertMessageBox, 
      styles.ValidatorsAlertMargin, 
      { [styles.ClickableAlert]: action })} 
    onClick={action}
    >
    <Space direction='vertical' size={8} className='w-100'>
      <div className={clsx('d-flex align-items-center SemiBold', { [styles.MobileView]: isMobile })}>
        <ExclamationCircleFilled className={clsx('bs-mr-2', styles.AlertIcon)} /> 
        {title}
      </div>
      {desc && <MutedDiv>{desc}</MutedDiv>}
    </Space>
    {action && <RightOutlined className={styles.ArrowIcon} />}
  </div>
}

type BondAlertProps = {
  network: string
}

export const BondAlert = ({ network }: BondAlertProps) => {
  const chainsInfo = useChainInfo()
  const validatorStakingInfo = useStakingInfo(network)
  const myAddress = useMyAddress()
  const { info } = useNominatorInfo(network, myAddress)
  const { t } = useTranslation()
  
  const [ showModal, setShowModal ] = useState<boolean>(false)

  const { stakingInfo } = validatorStakingInfo || {}

  const { minNominated } = stakingInfo || {}

  const { stakingLedger } = info || {}
  const { active } = stakingLedger || {}

  if(
    minNominated === undefined || 
    active === undefined || 
    (active && minNominated && new BN(active).gte(new BN(minNominated)))
  ) {
    return null
  }

  const decimals = getTokenDecimals(network, chainsInfo) 
  const symbol = getTokenSymbol(network, chainsInfo) 

  const minNominatedWithDecimals = minNominated ? convertToBalanceWithDecimal(minNominated, decimals) : BIGNUMBER_ZERO
  
  const minNominatedBond = <BalanceView value={minNominatedWithDecimals.toFormat()} fullPostfix symbol={symbol} />
  const minNominatedBondInDollars = <PriceView value={ minNominatedWithDecimals.toFormat() } network={network} />

  return <>
    <AlertMessage 
      network={network}
      title={t('validatorStaking.stakingScreen.alerts.bond.title')}
      desc={<>{t('validatorStaking.stakingScreen.alerts.bond.desc')} {minNominatedBond} ({minNominatedBondInDollars})</>} 
      action={() => setShowModal(true)}
    />

    <UnstakeAndStakeMoreModal network={network} open={showModal} type='stake' close={() => setShowModal(false)} />  
  </>
}

const isActiveValidorsOversubscribed = (
  nominators: string[], 
  maxNominatorRewardedfPerValidator: string, 
  validators: Record<string, ValidatorInfo>,
  myAddress: string
) => {
  if(!myAddress) return

  const isOversubscribed = nominators.map((validatorId) => {
    if(!myAddress) return

    const genericValidatorId = toGenericAccountId(validatorId)

    const validator = validators?.[genericValidatorId]

    const { isActive, exposure } = validator || {}

    const { others } = exposure || {}

    const myBond = others?.[myAddress]

    if(!isActive || !myBond) return

    const nominationsKeys = Object.keys(others)
    const nominationsEntries = Object.entries(others)

    if(new BN(nominationsKeys.length).lte(new BN(maxNominatorRewardedfPerValidator))) return false

    const sortedEntries = nominationsEntries.sort(([ , a ], [ , b ]) => new BN(b).minus(new BN(a)).toNumber())

    const sortedEntriesSlice = sortedEntries.slice(0, parseInt(maxNominatorRewardedfPerValidator))

    const [ account, minAmount ] = sortedEntriesSlice?.pop() as any[] || [ 0, 0 ]

    return account !== myAddress && new BN(myBond).lte(new BN(minAmount))

  }).filter(isDef)

  if(isEmptyArray(isOversubscribed)) return true

  return isOversubscribed.some(x => x === true)
}

const ERA_OFFSET = BIGNUMBER_ONE

type WaitingForTheNextEraProps = {
  network: string
}

const useIsWaitingNominator = (network: string) => {
  const myAddress = useMyAddress()

  const { info } = useNominatorInfo(network, myAddress)
  const validatorStakingInfo = useStakingInfo(network)

  const { stakingInfo } = validatorStakingInfo || {}
  
  const { era } = stakingInfo || {}

  const { submittedIn } = info || {}

  const submittedInProps = useMemo(() => {
    if(era === undefined || submittedIn === undefined) return

    const eraBN = new BN(era)

    const submittedInWithOffset = new BN(submittedIn).plus(ERA_OFFSET)

    return eraBN.lt(submittedInWithOffset)
  }, [ era, submittedIn, network ])

  return submittedInProps
}


export const WaitingForTheNextEraAlert = ({ network }: WaitingForTheNextEraProps) => {
  const { t } = useTranslation()
  const isWaitingNominator = useIsWaitingNominator(network)

  if(!isWaitingNominator) return null

  return isWaitingNominator ? <AlertMessage 
    network={network}
    title={t('validatorStaking.stakingScreen.alerts.waitingNominator.title')}
  /> : null
} 

type ValidatorsOverSubscribedAlertProps = {
  network: string
}

export const ValidatorsOverSubscribedAlert = ({ network }: ValidatorsOverSubscribedAlertProps) => {
  const myAddress = useMyAddress()
  const { info, loading } = useNominatorInfo(network, myAddress)
  const stakingProps = useStakingProps(network)
  const validatorStakingInfo = useStakingInfo(network)
  const { setCurrentStakingStep } = useStakingDashboardContext()
  const { t } = useTranslation()
  const isWaitingNominator = useIsWaitingNominator(network)

  const { stakingInfo } = validatorStakingInfo || {}

  const { nominators } = info || {}

  const { maxNominatorRewardedPerValidator } = stakingProps || {}

  const { validators, era } = stakingInfo || {}

  const isOversubscribed = useMemo(() => {
    if(
      !myAddress || 
      !maxNominatorRewardedPerValidator || 
      !validators || 
      !nominators || 
      isEmptyArray(nominators) ||
      isWaitingNominator === undefined
    ) return

    return isActiveValidorsOversubscribed(
      nominators,
      maxNominatorRewardedPerValidator,
      validators,
      myAddress
    )
  }, [ myAddress, network, !!maxNominatorRewardedPerValidator, !!validators, !!nominators, isWaitingNominator ])

  if(isWaitingNominator === true) return null

  if(!nominators?.length && loading === false) return (
    <AlertMessage 
      network={network}
      title={t('validatorStaking.stakingScreen.alerts.chooseValidators.title')}
      desc={<>{t('validatorStaking.stakingScreen.alerts.chooseValidators.desc')}</>} 
      action={() => setCurrentStakingStep(StakingDashboardStepsEnum.ChangeValidators)}
    /> 
  )

  return isOversubscribed && era && parseInt(era) !== 0
    ? <AlertMessage 
      network={network}
      title={t('validatorStaking.stakingScreen.alerts.changeValidators.title')}
      desc={<>{t('validatorStaking.stakingScreen.alerts.changeValidators.desc')}</>}
      action={() => setCurrentStakingStep(StakingDashboardStepsEnum.ChangeValidators)}
    /> : null
}