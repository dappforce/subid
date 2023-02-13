import { ClockCircleOutlined, RightOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import styles from './Index.module.sass'
import ActionModals, { ActionModalType } from './modals/ActionModals'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import { Space, Badge } from 'antd'
import clsx from 'clsx'
import UnlocksModal from './modals/UnlocksModal'
import { isEmptyArray } from '@subsocial/utils'
import { FiUnlock, FiLock } from 'react-icons/fi'
import { BiWallet, BiCheckCircle } from 'react-icons/bi'
import { AiOutlineUserSwitch } from 'react-icons/ai'
import { SubIcon, getTokenDecimals, getTokenSymbol } from '../../../utils/index'
import { getUnlockingData } from './modals/UnlocksModal'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { CheckOutlined } from '@ant-design/icons'
import { BalanceView } from '../../../homePage/address-views/utils/index'
import { BondAlert, ValidatorsOverSubscribedAlert, WaitingForTheNextEraAlert } from './Alerts'
import { useTranslation } from 'react-i18next'
import { useStakingInfo } from '../../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { useNominatorInfo } from '../../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'

type ActionPannelButtonProps = {
  label: React.ReactNode
  onClick: () => void
}

const ActionPannelButton = ({ label, onClick }: ActionPannelButtonProps) => {
  return <div className={styles.ActionButton} onClick={onClick}>
  <div className='d-flex align-items-center'>
    {label}
  </div>
  <RightOutlined className={styles.ActingButtonArrow}/>
</div>
}

type ActionsPannelProps = {
  network: string
}

const ActionsPannel = ({ network }: ActionsPannelProps) => {
  const [ modalType, setModalType ] = useState<ActionModalType | undefined>()
  const [ showUnlocksModal, setShowUnlocksModal ] = useState<boolean>(false)
  
  const [ open, setOpen ] = useState(false)
  const myAddress = useMyAddress()
  const validatorStakingInfo = useStakingInfo(network)
  const { info } = useNominatorInfo(network, myAddress)
  const chainsInfo = useChainInfo()
  const { t } = useTranslation()

  const { stakingInfo } = validatorStakingInfo || {}

  const decimals = getTokenDecimals(network, chainsInfo)
  const symbol = getTokenSymbol(network, chainsInfo)
  
  const { nominators, stakingLedger, controllerId } = info || {}
  const { unlocking } = stakingLedger || {}
  const { era } = stakingInfo || {}

  const unlockingData = useMemo(() => {
    if(!unlocking) return

    return getUnlockingData(unlocking, decimals, era)
  }, [ JSON.stringify(unlocking), era, network ])

  const onButtonClick = (modalType: ActionModalType) => {
    setModalType(modalType)
    setOpen(true)
  }

  const isUnlocked = unlockingData?.unlockedWithDecimals.isZero()

  const actionButtonsOpt = [
    {
      label: <>
        {unlockingData && <Badge count={<div className={clsx({
          [ styles.UnbondingUnlockingBadge ]: !unlockingData?.unbondingWithDecimals?.isZero(),
          [ styles.UnlockedUnlockingBadge ]: !isUnlocked,
        })}>
          {isUnlocked ? <ClockCircleOutlined /> : <CheckOutlined />}
        </div>}>
          <SubIcon Icon={isUnlocked ? FiLock : FiUnlock} />
        </Badge>} {t('validatorStaking.stakingScreen.actionsPannel.unlocks')} ({isUnlocked 
          ? t('validatorStaking.stakingScreen.actionsPannel.unbonding')
          : t('validatorStaking.stakingScreen.actionsPannel.unlocked')} 
        <BalanceView 
          className='ml-1' 
          value={isUnlocked
            ? unlockingData?.unbondingWithDecimals 
            : unlockingData?.unlockedWithDecimals} 
          symbol={symbol} 
        />)
      </>,
      onClick: () => setShowUnlocksModal(true),
      isVisible: unlocking && !isEmptyArray(unlocking)
    },
    {
      label: <><SubIcon Icon={BiWallet} /> {t('validatorStaking.stakingScreen.actionsPannel.rewardsDestination')}</>,
      onClick: () => onButtonClick('rewardDestination'),
      isVisible: true
    },
    {
      label:  <>
        <SubIcon Icon={BiCheckCircle} /> {t('validatorStaking.stakingScreen.actionsPannel.yourValidators')} ({nominators?.length})
      </>,
      onClick: () => onButtonClick('validators'),
      isVisible: true
    },
    {
      label: <><SubIcon Icon={AiOutlineUserSwitch} /> {t('validatorStaking.stakingScreen.actionsPannel.controllerAccount')}</>,
      onClick: () => onButtonClick('controller'),
      isVisible: true
    }
  ]

  const actionButtons = actionButtonsOpt.map(({ label, onClick, isVisible }, i) => 
    isVisible ? <ActionPannelButton key={i} label={label} onClick={onClick}/> : null)

  return <div className={styles.ActionsPannelBlock}>
    <BondAlert network={network} />
    <WaitingForTheNextEraAlert network={network}/>
    <ValidatorsOverSubscribedAlert network={network} />
    
    <Space direction='vertical' size={0} className={clsx('w-100')}>
      {actionButtons}
    </Space>

    <ActionModals open={open} modalType={modalType} close={() => setOpen(false)} network={network}/>

    {unlocking && <UnlocksModal 
      network={network} 
      open={showUnlocksModal} 
      unlocking={unlocking} 
      controllerId={controllerId}
      close={() => setShowUnlocksModal(false)} 
    />}
  </div>
}

export default ActionsPannel