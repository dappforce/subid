import Modal from 'antd/lib/modal'
import styles from '../Index.module.sass'
import clsx from 'clsx'
import { useMyAddress } from '../../../../providers/MyExtensionAccountsContext'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { useChainInfo } from '../../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { getBalanceWithDecimal, convertToBalanceWithDecimal } from '../../../../common/balances/utils'
import { TxFee } from '../../TxFee'
import { Space, Form } from 'antd'
import { useEffect, useState } from 'react'
import { MutedDiv } from '../../../../utils/MutedText'
import BN from 'bignumber.js'
import { useAppDispatch } from '../../../../../rtk/app/store'
import { toGenericAccountId } from '../../../../../rtk/app/util'
import { balancesActions } from '../../../../../rtk/features/balances/balancesSlice'
import { useTranslation } from 'react-i18next'
import { useLazyConnectionsContext } from '../../../../lazy-connection/LazyConnectionContext'
import { showParsedErrorMessage, getTokenDecimals } from '../../../../utils/index'
import { 
  fetchStakingLedger, 
  fetchStakingLadgerAndNominators, 
  useNominatorInfo 
} from '../../../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'
import { showSuccessMessage } from '../../../../utils/Message'
import { BondInput, useCalculatedUnstakingPeriod } from '../../utils'

export type ModalType = 'stake' | 'unstake'

type StakeMoreModalBodyProps = {
  network: string
  close: () => void
  type?: ModalType
  txParams: any
  amount: string
  setAmount: (amount: string) => void
}

type UnstakingDetailsProps = {
  network: string
}

const UnstakingDetails = ({ network }: UnstakingDetailsProps) => {
  const calculatedUnstakingPeriod = useCalculatedUnstakingPeriod({ network })
  const { t } = useTranslation()

  return <ul className={clsx(styles.UnstakeModalList, 'bs-mb-0 mt-2')}>
    <li>
      <MutedDiv>
        {t('validatorStaking.stakingScreen.modals.stakeMoreOrUnstake.unstakingPeriod', { bondingDuration: calculatedUnstakingPeriod })}
      </MutedDiv>
    </li>
    <li>
      <MutedDiv>
        {t('validatorStaking.stakingScreen.modals.stakeMoreOrUnstake.noRewards')}
      </MutedDiv>
    </li>
    <li>
      <MutedDiv>
        {t('validatorStaking.stakingScreen.modals.stakeMoreOrUnstake.redeem')}
      </MutedDiv>
    </li>
</ul>
}

const StakeMoreModalBody = ({ network, type, txParams, amount, setAmount }: StakeMoreModalBodyProps) => {
  const [ form ] = Form.useForm()
  const { t } = useTranslation()

  const txFee = <TxFee {...txParams} className='SemiBold' /> 

  return <Form form={form} layout='vertical' className='mt-0'>
    <Space direction='vertical' size={16} className='w-100'>
      <BondInput 
        form={form} 
        isModal 
        network={network} 
        type={type} 
        setAmount={setAmount} 
        amount={amount} 
      /> 
      <div className='d-flex align-items-center justify-content-between'>
        <div>{t('validatorStaking.stakingScreen.modals.networkFee')}</div> 
        {txFee}
      </div>
      {type === 'unstake' && <UnstakingDetails network={network} />}
    </Space>
  </Form>
}

type StakeMoreModalProps = {
  network: string
  open: boolean
  close: () => void
  type?: ModalType
}

const UnstakeAndStakeMoreModal = ({ network, open, close, type }: StakeMoreModalProps) => {
  const myAddress = useMyAddress()
  const dispatch = useAppDispatch()
  const chainsInfo = useChainInfo()
  const { info } = useNominatorInfo(network, myAddress)
  const [ amount, setAmount ] = useState('0')
  const { t } = useTranslation()
  const { getApiByNetwork } = useLazyConnectionsContext()
  
  useEffect(() => setAmount('0'), [])

  const { controllerId, stakingLedger } = info || {}

  const decimal = getTokenDecimals(network, chainsInfo)

  const isMaxUnstake = () => {
    const { active } = stakingLedger || {} 

    const activeWithDecimals = active ? convertToBalanceWithDecimal(active, decimal) : undefined

    return activeWithDecimals?.eq(amount) || false
  }

  const onSuccess = () => {
    if(!myAddress) return

    const genericAccountId = toGenericAccountId(myAddress)
    
    if(type === 'stake') {
      fetchStakingLedger(dispatch, network, genericAccountId)

      showSuccessMessage(t('validatorStaking.successMessages.stakeMore'))
    } else {
      if(isMaxUnstake()) {
        fetchStakingLadgerAndNominators(dispatch, network, genericAccountId)
      } else {
        fetchStakingLedger(dispatch,network, genericAccountId)
      }

      showSuccessMessage(t('validatorStaking.successMessages.unstake'))
    }
    
    dispatch(balancesActions.fetchBalances({ accounts: [ genericAccountId ], reload: true }))
    close()
  }

  const getAmount = () => !amount ? '0' : getBalanceWithDecimal(amount, decimal).toString()

  const getParams = async () => {
    const amountValue = getAmount()

    if(type === 'stake') {
      return [ amountValue ]
    } else {
      const api = await getApiByNetwork(network)

      if(!isMaxUnstake()) {
        return [ amountValue ]
      }

      return [
        [
          api.tx.staking.chill(),
          api.tx.staking.unbond(amountValue),
        ]
      ]
    }
  }

  const getUnstakeTx = () => isMaxUnstake() ? 'utility.batch' : 'staking.unbond'

  const txParams = {
    network,
    tx: type === 'stake' ? 'staking.bondExtra' : getUnstakeTx(),
    params: getParams,
  }

  const buttonLabel = type === 'stake' 
    ? t('validatorStaking.stakingScreen.modals.stakeMoreOrUnstake.stakeButton')
    : t('validatorStaking.stakingScreen.modals.stakeMoreOrUnstake.unstake')

  const modalTitle = type === 'stake' 
  ? t('validatorStaking.stakingScreen.modals.stakeMoreOrUnstake.stakeTitle') 
  : t('validatorStaking.stakingScreen.modals.stakeMoreOrUnstake.unstake')

  const footerButton = <LazyTxButton
    type='primary'
    block
    accountId={type === 'stake' ? myAddress : controllerId}
    disabled={!amount || new BN(amount).isZero()}
    onSuccess={onSuccess}
    onFailed={showParsedErrorMessage}
    className={clsx('d-flex justify-content-center align-items-center')}
    label={buttonLabel}
    {...txParams} 
  />

  return <Modal
    visible={open}
    title={<h3 className='SemiBold m-0'>{modalTitle}</h3>}
    footer={footerButton}
    width={600}
    destroyOnClose
    className={clsx('DfStakingModal', styles.ValidatorStakingModal)}
    onCancel={() => {
      close()
    }}
  >
    <StakeMoreModalBody 
      network={network} 
      type={type} 
      close={close} 
      txParams={txParams} 
      amount={amount}
      setAmount={setAmount}
    />
  </Modal>
}

export default UnstakeAndStakeMoreModal