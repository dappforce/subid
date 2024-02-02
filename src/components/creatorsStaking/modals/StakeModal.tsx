import Modal from '../tailwind-components/Modal'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import {
  StakeOrIncreaseStakeAmountInput,
  UnstakeAmountInput,
} from './AmountInput'
import React, { useEffect, useState } from 'react'
import { FormatBalance } from 'src/components/common/balances'
import { StakeOrIncreaseTxButton, UnstakeTxButton } from './TxButtons'
import { useGetChainDataByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'
import { DaysToWithdrawWarning } from '../utils/DaysToWithdraw'
import { useStakingConsts } from '../../../rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import { useBackerLedger } from '@/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import BN from 'bignumber.js'

const CurrentStake = () => {
  const myAddress = useMyAddress()
  const backerLedger = useBackerLedger(myAddress)
  const consts = useStakingConsts()
  const { decimal, tokenSymbol } = useGetChainDataByNetwork('subsocial')

  const { ledger } = backerLedger || {}

  const { locked } = ledger || {}

  const { minimumStakingAmount } = consts || {}

  const currentStake = (
    <FormatBalance
      value={locked}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const hideMinimumStake = new BN(locked || '0').lte(
    minimumStakingAmount || '0'
  )

  const minimumStakingAmountWithDecimals = (
    <FormatBalance
      value={new BN(minimumStakingAmount || '0')
        .minus(locked || '0')
        .toString()}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  return (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col gap-1 w-full bg-gray-50 p-4 rounded-2xl'>
        <div className='text-sm text-text-muted leading-5'>My current lock</div>
        <div className='font-medium text-base leading-6'>{currentStake}</div>
      </div>
      {!hideMinimumStake && (
        <div className='flex w-full flex-col gap-1 bg-gray-50 p-4 rounded-2xl'>
          <div className='text-sm text-text-muted leading-5'>Required lock</div>
          <div className='font-medium text-base leading-6'>
            {minimumStakingAmountWithDecimals}
          </div>
        </div>
      )}
    </div>
  )
}

export type StakingModalVariant = 'stake' | 'unstake' | 'increaseStake'

const modalData = {
  stake: {
    title: '🌟 Lock SUB',
    inputLabel: 'Lock amount:',
    balanceLabel: 'Balance',
    modalButton: 'Lock',
    amountInput: StakeOrIncreaseStakeAmountInput,
    actionButton: StakeOrIncreaseTxButton,
  },
  unstake: {
    title: '📤 Unlock SUB',
    inputLabel: 'Amount',
    balanceLabel: 'Locked',
    modalButton: 'Unlock',
    amountInput: UnstakeAmountInput,
    actionButton: UnstakeTxButton,
  },
  increaseStake: {
    title: '🌟 Lock more SUB',
    inputLabel: 'Lock amount',
    balanceLabel: 'Balance',
    modalButton: 'Lock',
    amountInput: StakeOrIncreaseStakeAmountInput,
    actionButton: StakeOrIncreaseTxButton,
  },
}

type StakeModalProps = {
  closeModal: () => void
  open: boolean
  spaceId: string
  modalVariant: StakingModalVariant
  amount?: string
  eventSource?: string
  setAmount: (amount: string) => void
}

const StakingModal = ({
  open,
  closeModal,
  spaceId,
  modalVariant,
  setAmount,
  amount,
  eventSource,
}: StakeModalProps) => {
  const [ inputError, setInputError ] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (open) {
      setAmount('')
      inputError && setInputError(undefined)
    }
  }, [ open ])

  const stakingConsts = useStakingConsts()

  const { decimal, tokenSymbol } = useGetChainDataByNetwork('subsocial')

  const {
    title,
    inputLabel,
    balanceLabel,
    modalButton,
    actionButton,
    amountInput,
  } = modalData[modalVariant]

  const StakingTxButton = actionButton

  const AmountInput = amountInput

  return (
    <Modal
      isOpen={open}
      withFooter={false}
      title={title}
      withCloseButton
      closeModal={() => {
        closeModal()
      }}
    >
      <div className='flex flex-col md:gap-6 gap-4'>
        {modalVariant === 'increaseStake' && <CurrentStake />}
        <AmountInput
          amount={amount}
          setAmount={setAmount}
          tokenSymbol={tokenSymbol}
          decimals={decimal}
          setInputError={setInputError}
          inputError={inputError}
          label={inputLabel}
          spaceId={spaceId}
          balanceLabel={balanceLabel}
          modalVariant={modalVariant}
        />

        <DaysToWithdrawWarning
          unbondingPeriodInEras={stakingConsts?.unbondingPeriodInEras}
        />

        <StakingTxButton
          amount={amount}
          decimal={decimal}
          spaceId={spaceId}
          label={modalButton}
          eventSource={eventSource}
          tokenSymbol={tokenSymbol}
          closeModal={closeModal}
          modalVariant={modalVariant}
          inputError={inputError}
        />
      </div>
    </Modal>
  )
}

export default StakingModal
