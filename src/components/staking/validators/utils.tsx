import { Collapse, Space, Button, Input, Form, Alert, Select } from 'antd'
import { MutedDiv, MutedSpan } from '../../utils/MutedText'
import styles from './ValidatorStaking.module.sass'
import { useChainInfo } from '../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useMyAddress, useMyExtensionAddresses } from '../../providers/MyExtensionAccountsContext'
import { useNominatingStakingContext, NominatingStepsEnum, RewardDestination, RewardDestinationKey } from './contexts/NominatingContext'
import { nonEmptyStr, isEmptyArray } from '@subsocial/utils'
import { useEffect, useMemo } from 'react'
import { AccountPreview } from 'src/components/table/utils'
import { convertToBalanceWithDecimal } from '../../common/balances/utils'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import clsx from 'clsx'
import { BalanceView } from '../../homePage/address-views/utils/index'
import { CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { getTotalBalance } from '../../table/utils'
import { usePrices } from '../../../rtk/features/prices/pricesHooks'
import { yearlyPercentage, payoutReturns } from './valculateAPY'
import { StartNominatingBondInputProps, StartNominatingRewardDestinationProps } from './starNominating/StakeBlock'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { useStakingInfo } from '../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { useStakingProps } from '../../../rtk/features/validators/stakingProps/stakingPropsHooks'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import { useFetchBalances, useBalancesByNetwork } from '../../../rtk/features/balances/balancesHooks'
import { useNominatorInfo } from '../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'
import { toGenericAccountId } from '../../../rtk/app/util'
import { getTransferableBalance } from '../../../utils/balance'
import { setAndValidateField } from '../../table/collatorStakingTable/utils'
import { SelectAccount } from '../../tips/TipModal'
import { isEthereumAddress } from '@polkadot/util-crypto'
import { ExternalLink } from '../../identity/utils'
import { getTokenSymbol, getPriceByNetwork, getTokenDecimals } from '../../utils/index'
import { useStakingContext, StakingStepsEnum } from './contexts/StakingScreenContext'
import { BIGNUMBER_ZERO } from '../../../config/app/consts'

const { Panel } = Collapse

type NominatingStepsCollapseProps = {
  title: React.ReactNode
  desc?: React.ReactNode
  children: React.ReactNode
  step: number
  disabled?: boolean
  customButton?: React.ReactNode
  disableButton?: boolean
  onContinue?: () => void
}

export const NominatingStepsCollapse = ({
  children,
  title,
  desc,
  step,
  disabled,
  customButton,
  disableButton,
  onContinue
}: NominatingStepsCollapseProps) => {
  const { currentStep, setCurrentStep, isFinishedSteps, bond, selectedValidators } = useNominatingStakingContext()
  const { setCurrentStakingStep } = useStakingContext()
  const { t } = useTranslation()

  const onBackClick = () => {
    if(currentStep === NominatingStepsEnum.Stake) {
      setCurrentStakingStep(StakingStepsEnum.Start)
      return
    }

    setCurrentStep(currentStep - 1)
  }

  const onContinueClick = () => {
    if(currentStep === NominatingStepsEnum.Summary) return

    setCurrentStep(currentStep + 1)

    onContinue?.()
  }

  const isFinishedStepsValues = Object.values(isFinishedSteps)

  const UndisableLastStep = isFinishedStepsValues.every(x => x === true) && step === NominatingStepsEnum.Summary

  const isCallapsible = !disabled || currentStep === step || UndisableLastStep ? undefined : 'disabled'

  const hideExpandIcon = step === NominatingStepsEnum.Summary 
    || currentStep === step 
    || (step === NominatingStepsEnum.Stake && (!bond || parseInt(bond) === 0))
    || isEmptyArray(selectedValidators)

  return (
    <Collapse
      accordion
      ghost
      expandIcon={() => hideExpandIcon
        ? null
        : <CheckCircleOutlined className={styles.PassedStep} /> }
      expandIconPosition='right'
      className={styles.NominatingStepCollapse}
      onChange={(key) => setCurrentStep(parseInt(key?.toString()))}
      collapsible={isCallapsible}
      activeKey={currentStep}
    >
      <Panel header={title} key={step}>
        {desc &&<MutedDiv className='mb-4'>{desc}</MutedDiv>}
        {children}

        <div className='d-flex align-items-center mt-4'>
          <Button block className='mr-2' onClick={onBackClick}>{t('validatorStaking.backButton')}</Button>
          {customButton 
            ? customButton 
            : <Button disabled={disableButton} type='primary' block className='ml-2' onClick={onContinueClick}>
              {t('validatorStaking.continueButton')}
            </Button>}
        </div>
      </Panel>
    </Collapse>
  )
}

export const useAPY = (network: string) => {
  const validatorStakingInfo = useStakingInfo(network)

  const { stakingInfo } = validatorStakingInfo || {}

  const { maxAPY } = stakingInfo || {}

  const apy = useMemo(() => {
    if(!maxAPY) return

    const apyPercentage = yearlyPercentage({ maxAPY: new BigNumber(maxAPY) }).multipliedBy(100).toFixed(2)

    return apyPercentage.toString() 
  }, [ maxAPY ])

  return apy
}

export const useAPR = (network: string) => {
  const validatorStakingInfo = useStakingInfo(network)

  const { stakingInfo } = validatorStakingInfo || {}

  const { maxAPY } = stakingInfo || {}

  const apr = useMemo(() => {
    if(!maxAPY) return

    const aprPercentage = payoutReturns({ maxAPY: new BigNumber(maxAPY) }).multipliedBy(100).toFixed(2)

    return aprPercentage.toString()
  }, [ maxAPY ])

  return apr
}

type ValidatorAccountPreviewProps = {
  address: string
}

export const ValidatorAccountPreview = ({ address }: ValidatorAccountPreviewProps) => {
  const { isMobile } = useResponsiveSize()

  return <AccountPreview 
    name={address}
    account={address} 
    largeAvatar
    withQr={!isMobile}
    halfLength={isMobile ? 5 : undefined}
    withAddress={!isMobile}
  />
} 

export const getPersentageView = (type: string, persentage?: string) => 
  persentage ? <>Estimated {type}: {persentage}%</> : <>-</>

type FormFields = {
  bond: string
}

export const fieldName = (name: keyof FormFields) => name

type BondInputProps = StartNominatingBondInputProps & {
  amount: string
  setAmount: (amount: string) => void 
}

export const BondInput = ({ form, network, type = 'stake', isModal = false, amount, setAmount }: BondInputProps) => {
  useFetchBalances()
  const myAddresses = useMyAddress()
  const myAddress = useMyAddress()
  const chainsInfo = useChainInfo()
  const { info } = useNominatorInfo(network, myAddresses)
  const { t } = useTranslation() 

  const stakingProps = useStakingProps(network)

  const { minNominatorBond } = stakingProps || {}

  const { stakingLedger } = info || {}

  const decimals = getTokenDecimals(network, chainsInfo)
  const nativeSymbol = getTokenSymbol(network, chainsInfo)

  const balancesByCurrency = useBalancesByNetwork({ address: toGenericAccountId(myAddress), network, currency: nativeSymbol })

  const availableBalance = balancesByCurrency ? getTransferableBalance(balancesByCurrency) : new BN(0)

  const accountBalance = decimals ? convertToBalanceWithDecimal(availableBalance.toString(), decimals) : BIGNUMBER_ZERO

  const activeStakedValue = stakingLedger?.active ? convertToBalanceWithDecimal(stakingLedger.active, decimals) : BIGNUMBER_ZERO

  const activeStaked = <BalanceView value={activeStakedValue} symbol={nativeSymbol} />

  const balance = <BalanceView value={accountBalance.toString()} symbol={nativeSymbol} />

  const isBalanceLessThenMinBond = minNominatorBond?.toString() && balancesByCurrency?.freeBalance 
  ? availableBalance.lt(new BN(minNominatorBond)) 
  : undefined
  
  const minBond = minNominatorBond ? convertToBalanceWithDecimal(minNominatorBond, decimals).toString() : '0'

  const maxAmount = type === 'stake' ? accountBalance : activeStakedValue

  const disableButton = type !== 'unstake' && !isModal && isBalanceLessThenMinBond || isBalanceLessThenMinBond === undefined

  const setMaxAmount = () => setAndValidateField(form, fieldName('bond'), maxAmount.toString())

  const maxBtn = <Button 
    ghost 
    type='link'
    className='p-0' 
    onClick={setMaxAmount} 
    disabled={disableButton} 
    size='small'
  >
    MAX
  </Button>

  
  const label = <div className={clsx('d-flex align-items-center justify-content-between w-100', styles.BlockTitle)}>
    <div>{t('validatorStaking.startNominatingScreen.stakeBlock.bondInput.label')}</div>
    {type === 'stake' 
      ? <div>
          <MutedSpan>
            {t('validatorStaking.startNominatingScreen.stakeBlock.bondInput.balance')}
          </MutedSpan> {balance}
        </div> 
      : <div>
        <MutedSpan>
          {t('validatorStaking.startNominatingScreen.stakeBlock.bondInput.staked')}
        </MutedSpan> {activeStaked}
      </div> }
  </div>

  return <div className={styles.BondInput}>
   {isBalanceLessThenMinBond && type === 'stake' && !isModal && <Alert 
      message={<>
        {t('validatorStaking.startNominatingScreen.stakeBlock.bondInput.bondAlert', { amount: minBond, symbol: nativeSymbol })} 
      </>} 
      className='mb-3'
      showIcon 
      type='warning' 
    />}
      
    <Form.Item 
      name={fieldName('bond')} 
      label={label} 
      required
      rules={[
        ({ getFieldValue }: any) => ({
          async validator () {
            const value = getFieldValue(fieldName('bond'))

            let amount = new BigNumber(value)
            let err = ''

            if (!value || amount.isNaN() || amount.isZero()) {
              amount = BIGNUMBER_ZERO
            } else if (amount.gt(maxAmount)) {
              err = 'You dot\'t have enough funds to spend specified amount'
            } else if (type === 'stake' && !isModal && minNominatorBond && isBalanceLessThenMinBond) {
              err = `Can't stake less than minimum value (${minBond} ${nativeSymbol})`
            } else if (
              type === 'unstake' && 
              isModal && 
              minNominatorBond && 
              activeStakedValue.minus(amount).lt(minBond) &&
              !maxAmount.eq(amount)
            ) {
              err = `Cannot have a nominator role, with value less than the minimum defined by, governance (${minBond} ${nativeSymbol}).`
            }

            if (nonEmptyStr(err)) {
              setAmount('0')
              return Promise.reject(err)
            }

            setAmount(value)
            
            return Promise.resolve()
          } })
        ]}
      >
      <Input 
        defaultValue={amount} 
        disabled={disableButton} 
        min='0' 
        step='0.1'
        type='number'
        suffix={maxBtn} 
      />
    </Form.Item>
    {type === 'unstake' && <div className='mt-4 d-flex align-items-center justify-content-between'>
      <div>Transferable:</div> <div className='SemiBold'>{balance}</div>
    </div>}
  </div>
}

type CalculatedUnstakingPeriond = {
  network: string
}

export const useCalculatedUnstakingPeriod = ({ network }: CalculatedUnstakingPeriond) => {
  const stakingProps = useStakingProps(network)

  const { bondingDuration, sessionsPerEra, epochDuration } = stakingProps || {}

  if(!bondingDuration || !sessionsPerEra || !epochDuration) return '-'

  const bondingDurationBN = new BigNumber(bondingDuration)
  const sessionsPerEraBN = new BigNumber(sessionsPerEra)
  const epochDurationBN = new BigNumber(epochDuration) 

  const daysInOneEra = epochDurationBN
    .multipliedBy(sessionsPerEraBN)
    .multipliedBy(6)
    .dividedBy(3600)
    .multipliedBy(bondingDurationBN)
    .dividedBy(24)
    .toNumber()

  if(daysInOneEra % 0 === 0) {
    return `${daysInOneEra} days`
  } else {
    let daysResult = ''
    let hoursResult = ''

    const [ days, decimalsPart ] = daysInOneEra.toString().split('.')

    if(days !== '0') {
      daysResult = `${days} days`

      if(decimalsPart === '0') {
        return daysResult
      }
    }    

    if(decimalsPart && decimalsPart !== '0') {
      const hours = new BigNumber(daysInOneEra).minus(days)

      const hoursBN = new BigNumber(hours)

      hoursResult = `${hoursBN.multipliedBy(24).toFixed(0)} hours`

      if(!daysResult) return hoursResult
    }

    return `${daysResult} ${hoursResult}`
  }
}

type RewardDestinationSelectProps = StartNominatingRewardDestinationProps & {
  rewardDestination: RewardDestination 
  setRewardDestination: (rewardDestination: RewardDestination) => void
  bond: string
}

export const getRewardDestinations = (t: TFunction) => [
  {
    key: 'Staked',
    title: t('validatorStaking.startNominatingScreen.stakeBlock.rewardDestination.restake'),
  },
  {
    key: 'Account',
    title: t('validatorStaking.startNominatingScreen.stakeBlock.rewardDestination.account'),
  },
]

export const RewardDestinationSelect = ({ 
  direction = 'horizontal', 
  network, 
  rewardDestination, 
  setRewardDestination,
  bond
}: RewardDestinationSelectProps) => {
  const apy = useAPY(network)
  const apr = useAPR(network)
  const prices = usePrices()
  const chainsInfo = useChainInfo()
  const { t, i18n: { language } } = useTranslation()
  const { isMobile } = useResponsiveSize()

  const tokenSymbol = getTokenSymbol(network, chainsInfo)

  const priceByNetwork = getPriceByNetwork(network, chainsInfo, prices)

  const [ aprValueInTokens, aprValueInDollars ] = useMemo(() => {
    if(!bond || !apr) return [ '0', '0' ]

    const aprInTokens = new BigNumber(bond).multipliedBy(new BigNumber(apr).dividedBy(100))

    const aprInDollars = getTotalBalance(aprInTokens, priceByNetwork)

    return [ aprInTokens.toFixed(4), aprInDollars.toFixed(2) ]
  }, [ bond, apr ])

  const [ apyValueInTokens, apyValueInDollars ] = useMemo(() => {
    if(!bond || !apy) return [ '0', '0' ]

    const apyInTokens = new BigNumber(bond).multipliedBy(new BigNumber(apy).dividedBy(100))

    const apyInDollars = getTotalBalance(apyInTokens, priceByNetwork)

    return [ apyInTokens.toFixed(4), apyInDollars.toFixed(2) ]

  }, [ bond, apy ])

  const rewardDestinations = useMemo(() => getRewardDestinations(t), [ language ])

  return <div>
    <div className={clsx('d-flex align-items-center justify-content-between', styles.BlockTitle)}>
      <div>{t('validatorStaking.startNominatingScreen.stakeBlock.rewardDestination.label')}</div>
      <ExternalLink 
        value={<>
          <MutedSpan>
            <QuestionCircleOutlined className='mr-1'/>
          </MutedSpan>
          {t('validatorStaking.startNominatingScreen.stakeBlock.rewardDestination.abountLink')}
        </>} 
        url='https://wiki.polkadot.network/docs/learn-staking#claiming-staking-rewards'
      />
    </div>
    <Space direction={isMobile ? 'vertical' : direction} size={16} className={styles.RewardsDestinationGrid}>
      {rewardDestinations.map(({ key, title }) => {
        return <div 
          key={key} 
          className={clsx(
            styles.DestinationCard, 'w-100', 
            { [ styles.ActiveDestinationCard ]: Object.keys(rewardDestination)[0] === key }
          )} 
          onClick={() => {
            if(Object.keys(rewardDestination)[0] === key) return 
            
            const rewardObj = {} as RewardDestination

            rewardObj[key as RewardDestinationKey] = null

            setRewardDestination(rewardObj)
          }}
        >
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <h3 className='SemiBold'>{title}</h3>
              <MutedDiv>{key === 'Staked' ? getPersentageView('APY', apy) : getPersentageView('APR', apr) }</MutedDiv>
            </div>
            <div className='text-right'>
              <h3 className='SemiBold'>{key === 'Staked' ? apyValueInTokens : aprValueInTokens} {tokenSymbol}</h3>
              <MutedDiv>${key === 'Staked' ? apyValueInDollars : aprValueInDollars}</MutedDiv>
            </div>
          </div>
        </div>
      })}
    </Space>
  </div>
}

type StakingAccountSelectProps = {
  network: string
  defaultValue?: string
  setAccount: (account: string) => void
  withTitle?: boolean
}

export const StakingAccountSelect = ({
  network,
  defaultValue,
  withTitle = true,
  setAccount
}: StakingAccountSelectProps) => {
  const chainsInfo = useChainInfo()
  const { t } = useTranslation()
  const injectedAccounts = useMyExtensionAddresses()

  const accountsForChoosing = injectedAccounts
    .filter((x) => !isEthereumAddress(x.address))
    .map((x) => x.address)

  useEffect(() => {
    if(!accountsForChoosing || defaultValue) return

    setAccount(toGenericAccountId(accountsForChoosing[0]))
  }, [ accountsForChoosing.length, defaultValue ])

  useEffect(() => {
    if(!defaultValue) return

    setAccount(toGenericAccountId(defaultValue))
  }, [ defaultValue ])

  const ss58Format = chainsInfo?.[network]?.ss58Format

  return (
    <div className={styles.SelectPayoutAccount}>
      {withTitle && <div className={styles.BlockTitle}>
        {t('validatorStaking.startNominatingScreen.stakeBlock.rewardDestination.payoutAccount')}
      </div>}
      <Select
        size='large'
        defaultValue={ toGenericAccountId(defaultValue) || accountsForChoosing[0]}
        style={{ width: '100%' }}
        onChange={setAccount}
      
      >
        {accountsForChoosing?.map((account) => (
          <Select.Option key={account} value={account}>
            <SelectAccount address={account} ss58Format={ss58Format} />
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}