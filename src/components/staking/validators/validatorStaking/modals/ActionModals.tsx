import Modal from 'antd/lib/modal'
import styles from '../Index.module.sass'
import clsx from 'clsx'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { useMyAddress } from '../../../../providers/MyExtensionAccountsContext'
import { TxFee } from '../../TxFee'
import { Space, Button } from 'antd'
import { ChangeControllerAccount, ChangeRewardDestination, MyNominatedValidators } from './utils'
import { NominatingStakingContextState, useNominatingStakingContext } from '../../contexts/NominatingContext'
import { useMemo } from 'react'
import { toGenericAccountId } from '../../../../../rtk/app/util'
import { AppDispatch, useAppDispatch } from '../../../../../rtk/app/store'
import { stakingNominatorInfoActions } from '../../../../../rtk/features/validators/nominatorInfo/nominatorInfoSlice'
import { useStakingDashboardContext, StakingDashboardStepsEnum } from '../../contexts/StakingDashboardContext'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { showParsedErrorMessage } from '../../../../utils/index'
import { isEmptyArray } from '@subsocial/utils'
import { useResponsiveSize } from '../../../../responsive/ResponsiveContext'
import { showSuccessMessage } from '../../../../utils/Message'
import { 
  useNominatorInfo, 
  fetchRewardDestination, 
  fetchController, 
  fetchNominators 
} from '../../../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'

type ActionModalsProps = {
  open: boolean
  close: () => void
  network: string
  modalType?: ActionModalType
}

export type ActionModalType = 'rewardDestination' | 'validators' | 'controller'

type StopNominatingButtonProps = {
  network: string
}

export const StopNominatingButton = ({ network }: StopNominatingButtonProps) => {
  const myAddress = useMyAddress()
  const dispatch = useAppDispatch()
  const { info } = useNominatorInfo(network, myAddress)
  const { t } = useTranslation()

  const { controllerId, nominators } = info || {}

  const onSuccess = () => {
    if(!myAddress) return

    const genericAccountId = toGenericAccountId(myAddress)
    dispatch(stakingNominatorInfoActions.fetchNominatorInfo({ account: genericAccountId, reload: true, network }))

    showSuccessMessage('All nominations has been revoked')
  }

  return <LazyTxButton
    block
    tx='staking.chill'
    accountId={controllerId}
    network={network}
    disabled={!nominators || isEmptyArray(nominators)}
    onSuccess={onSuccess}
    className={clsx('d-flex justify-content-center align-items-center')}
    label={t('validatorStaking.stakingScreen.modals.stopNominating')}
  />
}

type ActionButtonProps = {
  label: string
  network: string
  type: ActionModalType
  withFee?: boolean
  disabled?: boolean
  close?: () => void
}

export const ActionButton = ({ network, type, withFee = true, label, disabled = false, close }: ActionButtonProps) => {
  const myAddress = useMyAddress()
  const { info } = useNominatorInfo(network, myAddress) || {}
  const dispatch = useAppDispatch()
  const context = useNominatingStakingContext()
  const { setCurrentStakingStep } = useStakingDashboardContext()
  const { t } = useTranslation()

  const { controllerId, stakingLedger } = info || {}

  const { stash: stashId } = stakingLedger || {}

  const { tx, params, onSuccess, account } = useMemo(() => {
    if(!myAddress) return {}

    return getTxConfigByType({ 
      network, 
      dispatch, 
      myAddress, 
      type, 
      context, 
      close, 
      stashId, 
      controllerId,
      changeScreen: () => setCurrentStakingStep(StakingDashboardStepsEnum.Dashboard),
      t
    })
  }, [ JSON.stringify(context), myAddress, network ])

  const txParams = {
    network,
    tx,
    params,
  }

  return <Space direction='vertical' size={26} className='w-100'>
    {withFee && <div className='d-flex align-items-center justify-content-between'>
      {t('validatorStaking.stakingScreen.modals.networkFee')}
      <TxFee {...txParams} className='SemiBold' />
    </div>}

    <LazyTxButton
      type='primary'
      block
      accountId={account}
      disabled={disabled}
      onSuccess={onSuccess}
      onFailed={showParsedErrorMessage}
      className={clsx('d-flex justify-content-center align-items-center')}
      label={label}
      {...txParams} 
    />
  </Space>
}

type ModalButtonProps = {
  network: string
  type: ActionModalType
  close: () => void
}

const RewardDestinationActionButton = ({ network, type, close }: ModalButtonProps) => {
  const { t } = useTranslation()
  const myAddress = useMyAddress()
  const { rewardDestination } = useNominatingStakingContext()
  const { info } = useNominatorInfo(network, myAddress) || {}

  const { rewardDestination: rewardDestinationFromChain } = info || {}

  const disableButton = rewardDestinationFromChain 
    && rewardDestination 
    && JSON.stringify(rewardDestinationFromChain) === JSON.stringify(rewardDestination)

  return <ActionButton 
    network={network} 
    type={type} 
    disabled={disableButton} 
    close={close} 
    label={t('validatorStaking.stakingScreen.modals.rewardDestinationAction')} 
  />
}

const ControllerActionButton = ({ network, type, close }: ModalButtonProps) => {
  const { t } = useTranslation()
  const myAddress = useMyAddress()
  const { controller } = useNominatingStakingContext()
  const { info } = useNominatorInfo(network, myAddress) || {}

  const { controllerId: controllerFromChain } = info || {}

  const disableButton = toGenericAccountId(controllerFromChain) === toGenericAccountId(controller)

  return <ActionButton 
    network={network} 
    type={type} 
    disabled={disableButton || !controllerFromChain}
    label={t('validatorStaking.stakingScreen.modals.controllerAction')} 
    close={close} 
  />
}

const onRewardDestinationSuccess = (network: string, dispatch: AppDispatch, t: TFunction, close?: () => void, myAddress?: string) => {
  if(!myAddress) return

  const genericAccountId = toGenericAccountId(myAddress)
  fetchRewardDestination(dispatch, network, genericAccountId)

  showSuccessMessage(t('validatorStaking.successMessages.rewardDestination'))
  close?.()
}

const onControllerSuccess = (network: string, dispatch: AppDispatch, t: TFunction, close?: () => void, myAddress?: string) => {
  if(!myAddress) return

  const genericAccountId = toGenericAccountId(myAddress)
  fetchController(dispatch, network, genericAccountId)

  showSuccessMessage(t('validatorStaking.successMessages.controller'))
  close?.()
}

const onValidatorsSuccess = (network: string, dispatch: AppDispatch, t: TFunction, changeScreen?: () => void, myAddress?: string) => {
  if(!myAddress) return

  const genericAccountId = toGenericAccountId(myAddress)
  fetchNominators(dispatch, network, genericAccountId)

  showSuccessMessage(t('validatorStaking.successMessages.validators'))
  changeScreen?.()
}

const getValidatorsParams = (nominationContext: NominatingStakingContextState) => {
  const { selectedValidators } = nominationContext

  return selectedValidators.map((item: any) => {
    return {
      Id: item,
    }
  })
}

type GetTxConfigByTypeProps = {
  network: string
  dispatch: AppDispatch
  myAddress: string
  type: ActionModalType 
  context: NominatingStakingContextState
  close?: () => void
  stashId?: string
  controllerId?: string
  changeScreen?: () => void
  t: TFunction
}

const getTxConfigByType = ({
  network,
  dispatch,
  myAddress,
  type, 
  context,
  close,
  stashId, 
  controllerId,
  changeScreen,
  t
}: GetTxConfigByTypeProps) => {
  if(!stashId || !controllerId) return {} 

  const { rewardDestination, controller } = context

  const txConfig: Record<ActionModalType, any> = {
    rewardDestination: {
      tx: 'staking.setPayee',
      params: [ rewardDestination ],
      onSuccess: () => onRewardDestinationSuccess(network, dispatch, t, close, myAddress),
      account: controllerId
    }, 
    validators: {
      tx: 'staking.nominate',
      params: [ getValidatorsParams(context) ],
      onSuccess: () => onValidatorsSuccess(network, dispatch, t, changeScreen, myAddress),
      account: controllerId
    },
    controller: {
      tx: 'staking.setController',
      params: [ { Id: controller } ],
      onSuccess: () => onControllerSuccess(network, dispatch, t, close, myAddress),
      account: stashId
    }
  }

  return txConfig[type]
}

const getModalContentByType = (
  type: ActionModalType, 
  network: string, 
  context: NominatingStakingContextState, 
  changeDashboardScreen: () => void,
  close: () => void,
  t: TFunction,
  isMobile: boolean
) => {
  const { setController, rewardDestination, setRewardDestination } = context

  const content: Record<ActionModalType, any> = {
    rewardDestination: {
      title: t('validatorStaking.stakingScreen.modals.rewardDestinationTitle'),
      body: <ChangeRewardDestination 
        network={network} 
        rewardDestination={rewardDestination} 
        setRewardDestination={setRewardDestination} 
      />,
      action: <RewardDestinationActionButton network={network} type={type} close={close} />,
      footerLight: false
    },
    validators: {
      title: t('validatorStaking.stakingScreen.modals.validatorsTitle'),
      body: <MyNominatedValidators network={network} />,
      action: <Space 
        direction={isMobile ? 'vertical' : 'horizontal'} 
        size={16} 
        className={clsx('w-100', styles.StakeAndUnstakeButtons )}
      >
        <StopNominatingButton network={network} />
        <Button type='primary' block onClick={changeDashboardScreen}>
          {t('validatorStaking.stakingScreen.modals.validatorAction')}
        </Button>
      </Space>,
      footerLight: true
    },
    controller: {
      title: t('validatorStaking.stakingScreen.modals.controllerTitle'),
      body: <ChangeControllerAccount network={network} setController={setController} />,
      action: <ControllerActionButton network={network} type={type} close={close} />,
      footerLight: false
    },
  }

  return content[type]
}

const ActionModals = ({ network, open, close, modalType = 'rewardDestination' }: ActionModalsProps) => {
  const { setCurrentStakingStep } = useStakingDashboardContext()
  const context = useNominatingStakingContext()
  const { t, i18n: { language } } = useTranslation() 
  const { isMobile } = useResponsiveSize()

  const modalContentByType = useMemo(() => getModalContentByType(
    modalType, 
    network,
    context,
    () => setCurrentStakingStep(StakingDashboardStepsEnum.ChangeValidators),
    close,
    t,
    isMobile
  ), [ language, modalType, JSON.stringify(context), isMobile ])

  return <Modal
    visible={open}
    title={<h3 className='SemiBold m-0'>{modalContentByType.title}</h3>}
    footer={modalContentByType.action}
    width={520}
    destroyOnClose
    className={clsx('DfStakingModal', styles.ValidatorStakingModal, { [styles.FooterLight]: modalContentByType.footerLight })}
    onCancel={close}
  >
    {modalContentByType.body}
  </Modal>
}

export default ActionModals