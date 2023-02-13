import Modal from 'antd/lib/modal'
import styles from '../Index.module.sass'
import modalsStyles from './Modals.module.sass'
import clsx from 'clsx'
import { useMyAddress } from '../../../../providers/MyExtensionAccountsContext'
import { Space } from 'antd'
import { Unlocking } from '../../../../../rtk/features/validators/nominatorInfo/types'
import { useChainInfo } from '../../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { convertToBalanceWithDecimal } from '../../../../common/balances/utils'
import { BalanceView } from '../../../../homePage/address-views/utils/index'
import { MutedDiv } from '../../../../utils/MutedText'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { useAppDispatch } from '../../../../../rtk/app/store'
import { useTranslation } from 'react-i18next'
import { showParsedErrorMessage, getTokenSymbol, getTokenDecimals } from '../../../../utils/index'
import { useStakingProps } from '../../../../../rtk/features/validators/stakingProps/stakingPropsHooks'
import { useStakingInfo } from '../../../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { fetchStakingLedger } from '../../../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'
import { useResponsiveSize } from '../../../../responsive/ResponsiveContext'
import { showSuccessMessage } from '../../../../utils/Message'
import { BIGNUMBER_ZERO } from '../../../../../config/app/consts'
import BN from 'bignumber.js'

type StakeMoreModalBodyProps = {
  network: string
  close: () => void
  unlocking: Unlocking[]
  unlockingData: any
}

export const getUnlockingData = (unlocking: Unlocking[], decimals: number, era?: string) => {
  let total = BIGNUMBER_ZERO 
  let unlocked = BIGNUMBER_ZERO
  let unbonding = BIGNUMBER_ZERO

  era !== undefined && unlocking.forEach(({ value, era: unlockingEra }) => {
    if(new BN(era).gte(unlockingEra)) {
      unlocked = unlocked.plus(value)
    } else {
      unbonding = unbonding.plus(value)
    }

    total = total.plus(value)
  })

  const { value, era: unlockingEra } = unlocking.find(x => new BN(x.era).gt(era || 0)) || {}

  const totalWithDecimals = convertToBalanceWithDecimal(total.toString(), decimals)
  const unlockedWithDecimals = convertToBalanceWithDecimal(unlocked.toString(), decimals)
  const unbondingWithDecimals = convertToBalanceWithDecimal(unbonding.toString(), decimals)

  const firstUnlockingValue = era && value ? convertToBalanceWithDecimal(value, decimals) : BIGNUMBER_ZERO

  return { 
    totalWithDecimals, 
    unlockedWithDecimals, 
    unbondingWithDecimals,
    firstUnlockingValue,
    unlockingEra
  }
}

type UnlockingBlockProps = {
  title: string
  value: BN
  symbol: string
}

const UnlockingBlock = ({ title, value, symbol }: UnlockingBlockProps) =>
  <div className={modalsStyles.UnstakeBlock}>
    <MutedDiv>{title}</MutedDiv>
    <div className={modalsStyles.UnlockingValue}>{<BalanceView value={value} symbol={symbol} />}</div>
  </div>

const UnlocksModalBody = ({ network, unlocking, unlockingData }: StakeMoreModalBodyProps) => {
  const { totalWithDecimals, unlockedWithDecimals, unbondingWithDecimals, firstUnlockingValue, unlockingEra } = unlockingData
  const stakingProps = useStakingProps(network)
  const chainsInfo = useChainInfo()
  const { t } = useTranslation()
  const { isMobile } = useResponsiveSize()

  const symbol = getTokenSymbol(network, chainsInfo)

  const { bondingDuration } = stakingProps || {}

  if(!unlocking) return null

  const unlockingBlocksOpt = [
    {
      title: t('validatorStaking.stakingScreen.modals.unlocks.unlocked'),
      value: unlockedWithDecimals
    },
    {
      title: t('validatorStaking.stakingScreen.modals.unlocks.unbonding'),
      value: unbondingWithDecimals
    },
    {
      title: t('validatorStaking.stakingScreen.modals.unlocks.total'),
      value: totalWithDecimals
    },
  ]

  const unlockingBlocks = unlockingBlocksOpt.map(({ title, value }, i) => 
    <UnlockingBlock key={i} title={title} value={value} symbol={symbol}/>)

  return <Space direction='vertical' size={24} className='w-100'>
    <Space direction={isMobile ? 'vertical' : 'horizontal'} size={16} className='w-100 justify-content-between'>
      {unlockingBlocks}
    </Space>
    {!firstUnlockingValue.isZero() && <div className={modalsStyles.UnstakeBlock}>
      <MutedDiv>{t('validatorStaking.stakingScreen.modals.unlocks.unlocksAfter')} {unlockingEra}</MutedDiv>
      <div className={modalsStyles.UnlockingValue}>
        <BalanceView value={firstUnlockingValue} symbol={symbol} />
      </div>
    </div>}

    <MutedDiv>
      {t('validatorStaking.stakingScreen.modals.unlocks.desc', { bondingDuration: bondingDuration || '0' })}
    </MutedDiv>
  </Space>
}

type StakeMoreModalProps = {
  network: string
  open: boolean
  close: () => void
  controllerId: string
  unlocking: Unlocking[]
}

const UnlocksModal = ({ network, open, close, unlocking, controllerId }: StakeMoreModalProps) => {
  const validatorStakingInfo = useStakingInfo(network)
  const myAddress = useMyAddress()
  const chainsInfo = useChainInfo()
  const dispatch = useAppDispatch()
  const stakingProps = useStakingProps(network)
  const { t } = useTranslation()

  const { stakingInfo } = validatorStakingInfo || {}

  const { era } = stakingInfo || {}
  const { historyDepth } = stakingProps || {}

  const decimals = getTokenDecimals(network, chainsInfo)

  const unlockingData = getUnlockingData(unlocking, decimals, era)

  const { unlockedWithDecimals } = unlockingData

  const onSuccess = () => {
    if(!myAddress) return
    
    fetchStakingLedger(dispatch, network, myAddress)

    showSuccessMessage(t('validatorStaking.successMessages.withdrawUnlocks'))
    close()
  }

  return <Modal
    visible={open}
    title={<h3 className='SemiBold m-0'>{'Unlocks'}</h3>}
    footer={!unlockedWithDecimals.isZero() ? <LazyTxButton
      type='primary'
      block
      accountId={controllerId}
      network={network}
      tx='staking.withdrawUnbonded'
      params={[ historyDepth ]}
      disabled={!historyDepth}
      onFailed={showParsedErrorMessage}
      onSuccess={onSuccess}
      className={clsx('d-flex justify-content-center align-items-center')}
      label={t('validatorStaking.stakingScreen.modals.unlocks.withdrawButton')}
    /> : null}
    destroyOnClose
    className={clsx('DfStakingModal', styles.ValidatorStakingModal, { [modalsStyles.UnlocksModal]: unlockedWithDecimals.isZero() })}
    onCancel={() => close()}
  >
    <UnlocksModalBody network={network} close={close} unlocking={unlocking} unlockingData={unlockingData} />
  </Modal>
}

export default UnlocksModal