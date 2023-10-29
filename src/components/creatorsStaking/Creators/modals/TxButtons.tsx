import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import Button from '../../tailwind-components/Button'
import { getBalanceWithDecimal } from 'src/components/common/balances'
import { fetchBalanceByNetwork, useBalancesByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { getTransferableBalance } from 'src/utils/balance'
import { BN_ZERO } from '@polkadot/util'
import { fetchBackerInfo, useBackerInfo } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import BN from 'bn.js'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchEraStakes } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { fetchGeneralEraInfo, useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { fetchBackerLedger } from 'src/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { StakingModalVariant, betaVersionAgreementStorageName } from './StakeModal'
import { showParsedErrorMessage } from 'src/components/utils'
import { useModalContext } from '../../contexts/ModalContext'
import store from 'store'

export type CommonTxButtonProps = {
  amount: string
  spaceId: string
  decimal: number
  label: string
  tokenSymbol: string
  closeModal: () => void
  modalVariant?: StakingModalVariant
  inputError?: string
  disabled?: boolean  
}

type StakingTxButtonProps = CommonTxButtonProps & {
  tx: string
}

const StakingTxButton = ({ 
  amount, 
  spaceId, 
  decimal, 
  label,
  disabled,
  tx,
  closeModal,
  modalVariant,
  inputError,
}: StakingTxButtonProps) => {
  const myAddress = useMyAddress()
  const dispatch = useAppDispatch()
  const eraInfo = useGeneralEraInfo()
  const { setShowSuccessModal, setStakedSpaceId } = useModalContext()

  const onSuccess = () => {
    fetchBalanceByNetwork(dispatch, [ myAddress || '' ], 'subsocial')
    fetchBackerInfo(dispatch, [ spaceId ], myAddress || '')
    fetchGeneralEraInfo(dispatch)
    fetchEraStakes(dispatch, [ spaceId ], eraInfo?.info?.currentEra || '0')
    
    fetchBackerLedger(dispatch, myAddress || '')

    if(modalVariant === 'stake') {
      setStakedSpaceId(spaceId)
      setShowSuccessModal(true)
      store.set(betaVersionAgreementStorageName, true)
    }
    
    closeModal()
  }

  const buildParams = () => {
    const amountWithDecimals = getBalanceWithDecimal(amount, decimal)

    return [ spaceId, amountWithDecimals.toString() ]
  }
  
  const Component: React.FunctionComponent<{ onClick?: () => void }> = (
    compProps
    ) => (
      <Button
      {...compProps}
      variant={'primary'}
      size={'lg'}
      className='w-full text-base'
      >
      {label}
    </Button>
  )
  
  const disableButton = !myAddress || !amount || amount === '0' || !!inputError || disabled

  return (
    <LazyTxButton
      network='subsocial'
      accountId={myAddress}
      tx={tx}
      disabled={disableButton}
      component={Component}
      params={buildParams}
      onFailed={showParsedErrorMessage}
      onSuccess={onSuccess}
    />
  )
}

export const StakeOrIncreaseTxButton = (props: CommonTxButtonProps) => {
  const myAddress = useMyAddress()

  const balancesByCurrency = useBalancesByNetwork({
    address: myAddress,
    network: 'subsocial',
    currency: props.tokenSymbol,
  })

  const availableBalance = balancesByCurrency
    ? getTransferableBalance(balancesByCurrency)
    : BN_ZERO
  
  return <StakingTxButton 
    {...props}
    disabled={availableBalance.isZero() || props.disabled}
    tx='creatorStaking.stake'
  />
}

export const UnstakeTxButton = (props: CommonTxButtonProps) => {
  const myAddress = useMyAddress()
  const backerInfo = useBackerInfo(props.spaceId, myAddress)
  const { info } = backerInfo || {}

  const { totalStaked } = info || {}

  return <StakingTxButton 
    {...props}
    disabled={!totalStaked || new BN(totalStaked).isZero() || props.disabled}
    tx='creatorStaking.unstake'
  />
}