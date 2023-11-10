import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import {
  StakeOrIncreaseStakeAmountInput,
  UnstakeAmountInput,
} from './AmountInput'
import React, { useEffect, useState, ChangeEvent } from 'react'
import { useBackerInfo } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { FormatBalance } from 'src/components/common/balances'
import { StakeOrIncreaseTxButton, UnstakeTxButton } from './TxButtons'
import { useGetDecimalsAndSymbolByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'
import Checkbox from '../../tailwind-components/Checkbox'
import { linkTextStyles } from '../../tailwind-components/LinkText'
import store from 'store'
import clsx from 'clsx'
import { DaysToWithdrawWarning } from '../../utils/DaysToWithdraw'
import { useStakingConsts } from '../../../../rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import AccountPreview from '../AccountPreview'

export const betaVersionAgreementStorageName = 'BetaVersionAgreement'

type BetaVersionAgreementProps = {
  setIsCheckboxChecked: (checked: boolean) => void
  isCheckboxChecked: boolean
}

const BetaVersionAgreement = ({
  isCheckboxChecked,
  setIsCheckboxChecked,
}: BetaVersionAgreementProps) => {
  const [ isTextClamped, setIsTextClamped ] = useState(true)

  useEffect(() => {
    setIsTextClamped(true)
  }, [])

  const onCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsCheckboxChecked(e.target.checked)
  }

  return (
    <Checkbox
      label={
        <div>
          <div
            className={clsx('text-text-muted', {
              ['line-clamp-1']: isTextClamped,
            })}
          >
            I agree to the rules of the beta version of Creator Staking. <br />{' '}
            <br />I understand that this is the beta version of Creator Staking
            and that the staking system is under active development and may be
            upgraded in the next few months, resulting in my tokens being
            unstaked, and that I will have to stake them again. I understand
            that the inflation and rewards distribution numbers may be changed
            during the beta without my knowledge.
          </div>
          {isTextClamped && (
            <span
              className={linkTextStyles({ variant: 'primary' })}
              onClick={() => setIsTextClamped(false)}
            >
              Read more
            </span>
          )}
        </div>
      }
      onChange={onCheckboxChange}
      value={isCheckboxChecked}
    />
  )
}

type CurrentStakeProps = {
  spaceId: string
}

const CurrentStake = ({ spaceId }: CurrentStakeProps) => {
  const myAddress = useMyAddress()
  const backerInfo = useBackerInfo(spaceId, myAddress)
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')

  const { info } = backerInfo || {}

  const { totalStaked } = info || {}

  const currentStake = (
    <FormatBalance
      value={totalStaked}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  return (
    <div className='flex flex-col gap-1 bg-gray-50 p-4 rounded-2xl'>
      <div className='text-sm text-text-muted leading-5'>My current stake</div>
      <div className='font-medium text-base leading-6'>{currentStake}</div>
    </div>
  )
}

export type StakingModalVariant = 'stake' | 'unstake' | 'increaseStake'

const modalData = {
  stake: {
    title: '🌟 Stake',
    inputLabel: 'Stake amount',
    balanceLabel: 'Balance',
    modalButton: 'Start staking',
    amountInput: StakeOrIncreaseStakeAmountInput,
    actionButton: StakeOrIncreaseTxButton,
  },
  unstake: {
    title: '📤 Unstake',
    inputLabel: 'Amount',
    balanceLabel: 'Staked',
    modalButton: 'Unstake',
    amountInput: UnstakeAmountInput,
    actionButton: UnstakeTxButton,
  },
  increaseStake: {
    title: '🌟 Increase Stake',
    inputLabel: 'Increase stake by',
    balanceLabel: 'Balance',
    modalButton: 'Increase',
    amountInput: StakeOrIncreaseStakeAmountInput,
    actionButton: StakeOrIncreaseTxButton,
  },
}

type StakeModalProps = {
  closeModal: () => void
  open: boolean
  spaceId: string
  modalVariant: StakingModalVariant
  amount: string
  setAmount: (amount: string) => void
}

const StakingModal = ({
  open,
  closeModal,
  spaceId,
  modalVariant,
  setAmount,
  amount,
}: StakeModalProps) => {
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)
  const [ inputError, setInputError ] = useState<string | undefined>(undefined)
  const [ isCheckboxChecked, setIsCheckboxChecked ] = useState(false)
  const betaversionAgreement = store.get(
    betaVersionAgreementStorageName
  ) as boolean

  useEffect(() => {
    if (open) {
      setAmount('')
      inputError && setInputError(undefined)
    }
  }, [ open ])

  const stakingConsts = useStakingConsts()

  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')

  const { space } = creatorSpaceEntity || {}

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
        <AccountPreview spaceId={spaceId} space={space} />
        {modalVariant === 'increaseStake' && <CurrentStake spaceId={spaceId} />}
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

        {!betaversionAgreement && (
          <BetaVersionAgreement
            isCheckboxChecked={isCheckboxChecked}
            setIsCheckboxChecked={setIsCheckboxChecked}
          />
        )}

        <StakingTxButton
          amount={amount}
          decimal={decimal}
          spaceId={spaceId}
          label={modalButton}
          tokenSymbol={tokenSymbol}
          closeModal={closeModal}
          modalVariant={modalVariant}
          inputError={inputError}
          disabled={!isCheckboxChecked && !betaversionAgreement}
        />
      </div>
    </Modal>
  )
}

export default StakingModal
