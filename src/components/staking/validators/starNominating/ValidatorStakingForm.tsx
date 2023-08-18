import { NominatingStepsCollapse } from '../utils'
import { Space } from 'antd'
import styles from '../ValidatorStaking.module.sass'
import { NominatingStepsEnum, useNominatingStakingContext, RewardDestination } from '../contexts/NominatingContext'
import { ExternalLink } from '../../../identity/utils'
import BN from 'bignumber.js'
import { StakeBlock } from './StakeBlock'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useTranslation } from 'react-i18next'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import { useStakingContext, StakingStepsEnum } from '../contexts/StakingScreenContext'
import { useLazyConnectionsContext } from '../../../lazy-connection/LazyConnectionContext'
import { useAppDispatch } from '../../../../rtk/app/store'
// import { getBalanceWithDecimal } from '../../../common/balances/utils'
import { toGenericAccountId } from '../../../../rtk/app/util'
import { stakingNominatorInfoActions } from '../../../../rtk/features/validators/nominatorInfo/nominatorInfoSlice'
import { balancesActions } from '../../../../rtk/features/balances/balancesSlice'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { isEmptyArray } from '@subsocial/utils'
import clsx from 'clsx'
import { TxFee } from '../TxFee'
import { PageTitle, showParsedErrorMessage, getTokenSymbol } from '../../../utils/index'
import { useFetchStakingInfo } from '../../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { SetValidators } from './SetValidators'
import { Summary } from './Summary'
import { useEffect } from 'react'

const getRewardDestinationData = (rewardDestination: RewardDestination) => {
  /// Reward destination has only one value in the entries, so we extract the first element from it
  const [ key, value ] = Object.entries(rewardDestination)[0]

  return {
    rewardDestinationKey: key,
    addressOrNull: value
  }
}

type ValidatorStakingFormProps = {
  network: string
}

const StakeSection = ({ network }: ValidatorStakingFormProps) => {
  const { bond, rewardDestination, setIsFinishedSteps, isFinishedSteps: { stakeStepFinished } } = useNominatingStakingContext()
  const { t } = useTranslation()
  const chainsInfo = useChainInfo()

  const tokenSymbol = getTokenSymbol(network, chainsInfo)

  useEffect(() => {
    if(!bond || parseInt(bond) === 0) { 
      setIsFinishedSteps({ stakeStepFinished: false }) 
    } else {
      !stakeStepFinished && setIsFinishedSteps({ stakeStepFinished: true }) 
    }
  }, [ bond ])

  const { rewardDestinationKey, addressOrNull } = getRewardDestinationData(rewardDestination)

  return <NominatingStepsCollapse
    title={t('validatorStaking.startNominatingScreen.stake.title', { symbol: tokenSymbol })}
    desc={t('validatorStaking.startNominatingScreen.stake.subtitle')}
    step={NominatingStepsEnum.Stake}
    disabled={false}
    disableButton={!bond || new BN(bond).isZero() || (rewardDestinationKey === 'Account' && !addressOrNull)}
    onContinue={() => setIsFinishedSteps({ stakeStepFinished: true })}
  >
  <StakeBlock network={network} />
</NominatingStepsCollapse>
}

const SelectValidatorsSection = ({ network }: ValidatorStakingFormProps) => {
  const { selectedValidators, setIsFinishedSteps } = useNominatingStakingContext()
  const { t } = useTranslation()

  useEffect(() => {
    if(!selectedValidators || isEmptyArray(selectedValidators)) {
      setIsFinishedSteps({ setValidatorsStepFinished: false })
    }
  }, [ !!selectedValidators, selectedValidators.length ])

  return <NominatingStepsCollapse
    title={t('validatorStaking.startNominatingScreen.selectValidators.title')}
    desc={t('validatorStaking.startNominatingScreen.selectValidators.subtitle')}
    step={NominatingStepsEnum.SetValidators}
    disabled={!selectedValidators.length}
    disableButton={!selectedValidators.length}
    onContinue={() => setIsFinishedSteps({ setValidatorsStepFinished: true })}
  >
  <SetValidators network={network} />
</NominatingStepsCollapse>
}

type SummaryCollapseSectionProps = {
  network: string
}

export const SummaryCollapseSection = ({ network }: SummaryCollapseSectionProps) => {
  const myAddress = useMyAddress()
  const { bond, selectedValidators, rewardDestination } = useNominatingStakingContext()
  const { setCurrentStakingStep } = useStakingContext()
  const { getApiByNetwork } = useLazyConnectionsContext()
  // const chainsInfo = useChainInfo()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  // const { tokenDecimals } = chainsInfo[network] || {}

  // const decimal = tokenDecimals?.[0] || 0

  const getParams = async () => {
    if(!myAddress) return []

    const api = await getApiByNetwork(network)

    // const stashToSubmit = {
    //   Id: myAddress,
    // }

    const targetsToSubmit = selectedValidators.map((item: any) => ({ Id: item }))

    const txs = [
      [
        // api.tx.staking.bond(stashToSubmit, getBalanceWithDecimal(bond || '0', decimal).toString(), rewardDestination),
        api.tx.staking.nominate(targetsToSubmit),
      ]
    ]
  
    return txs
  }

  const onSuccess = () => {
    if(!myAddress) return

    const genericAccountId = toGenericAccountId(myAddress)

    dispatch(stakingNominatorInfoActions.fetchNominatorInfo({ account: genericAccountId, reload: true, network }))
    dispatch(balancesActions.fetchBalances({ accounts: [ genericAccountId ] }))
    setCurrentStakingStep(StakingStepsEnum.Staking)
  }

  const txParams = {
    network,
    tx: 'utility.batchAll',
    params: getParams,
  }

  const { rewardDestinationKey, addressOrNull } = getRewardDestinationData(rewardDestination)

  const confirmAndStake = <LazyTxButton
    type='primary'
    block
    accountId={myAddress}
    disabled={!bond 
      || new BN(bond).isZero() 
      || isEmptyArray(selectedValidators 
      || (rewardDestinationKey === 'Account' && !addressOrNull))}
    onSuccess={onSuccess}
    onFailed={showParsedErrorMessage}
    className={clsx('d-flex justify-content-center align-items-center ml-2')}
    label={'Confirm & Stake'}
    {...txParams}
/>
  const txFee = <TxFee {...txParams} className='SemiBold' /> 

  return <NominatingStepsCollapse
    title={t('validatorStaking.startNominatingScreen.summary.title')}
    step={NominatingStepsEnum.Summary}
    customButton={confirmAndStake}
    disabled={!false}
  >
    <Summary network={network} txFee={txFee} /> 
  </NominatingStepsCollapse>
}

const InnerValidatorStakingForm = ({ network }: ValidatorStakingFormProps) => {
  useFetchStakingInfo(network)
  const { t } = useTranslation()

  return (
    <div>
      <PageTitle 
        title={t('validatorStaking.startNominatingScreen.title')}
        desc={<>
          {t('validatorStaking.startNominatingScreen.subtitle')}
          <ExternalLink 
            url={'https://wiki.polkadot.network/docs/learn-staking#claiming-staking-rewards'} 
            value={t('validatorStaking.startNominatingScreen.linkText')} 
          />
        </>}
      />
      <Space direction='vertical' size={16} className={styles.StepsItems}>
        <StakeSection network={network} />
        <SelectValidatorsSection network={network} />
        <SummaryCollapseSection network={network} />
      </Space>
    </div>
  )
}

const ValidatorStakingForm = ({ network }: ValidatorStakingFormProps) => {
  return <InnerValidatorStakingForm network={network} /> 
}

export default ValidatorStakingForm
