import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import Button from '../../tailwind-components/Button'
import { getBalanceWithDecimal } from 'src/components/common/balances'
import { fetchBalanceByNetwork, useBalancesByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { getTransferableBalance } from 'src/utils/balance'
import { BN_ZERO } from '@polkadot/util'
import { fetchStakerInfo, useStakerInfo } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import BN from 'bn.js'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchEraStakes } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { fetchStakerLedger } from 'src/rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'
import { StakingModalVariant } from './StakeModal'
import { showParsedErrorMessage } from 'src/components/utils'

export type CommonTxButtonProps = {
  amount: string
  spaceId: string
  decimal: number
  label: string
  tokenSymbol: string
  closeModal: () => void
  modalVariant?: StakingModalVariant
  setModalVariant?: (variant: StakingModalVariant) => void
  inputError?: string
}

type StakingTxButtonProps = CommonTxButtonProps & {
  disabled: boolean
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
  setModalVariant,
  inputError,
}: StakingTxButtonProps) => {
  const myAddress = useMyAddress()
  const dispatch = useAppDispatch()
  const eraInfo = useGeneralEraInfo()

  const onSuccess = () => {
    fetchStakerInfo(dispatch, [spaceId], myAddress || '')
    fetchBalanceByNetwork(dispatch, [myAddress || ''], 'subsocial')
    fetchEraStakes(dispatch, [spaceId], eraInfo?.currentEra || '0')
    fetchStakerLedger(dispatch, myAddress || '')

    if(modalVariant === 'stake') {
      setModalVariant && setModalVariant('success')
    } else {
      closeModal()
    }
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
      className='w-full'
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
    disabled={availableBalance.isZero()}
    tx='creatorStaking.stake'
  />
}

export const UnstakeTxButton = (props: CommonTxButtonProps) => {
  const myAddress = useMyAddress()
  const stakerInfo = useStakerInfo(props.spaceId, myAddress)
  const { info } = stakerInfo || {}

  const { totalStaked } = info || {}


  return <StakingTxButton 
    {...props}
    disabled={!totalStaked || new BN(totalStaked).isZero()}
    tx='creatorStaking.unstake'
  />
}