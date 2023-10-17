import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import {
  StakeOrIncreaseStakeAmountInput,
  UnstakeAmountInput,
} from './AmountInput'
import { useEffect, useState } from 'react'
import { useBackerInfo } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { FormatBalance } from 'src/components/common/balances'
import {
  StakeOrIncreaseTxButton,
  UnstakeTxButton,
} from './TxButtons'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { useEraStakesById } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { pluralize } from '@subsocial/utils'
import { useGetDecimalsAndSymbolByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'
import { CreatorPreview } from '../../utils/CreatorPreview'
import { useResponsiveSize } from 'src/components/responsive'

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
  const { isMobile } = useResponsiveSize()
  const [ inputError, setInputError ] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (open) {
      setAmount('')
      inputError && setInputError(undefined)
    }
  }, [ open ])

  const generalEraInfo = useGeneralEraInfo()
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')

  const { currentEra } = generalEraInfo || {}

  const eraStake = useEraStakesById(spaceId, currentEra)

  const { space } = creatorSpaceEntity || {}
  const { info } = eraStake || {}

  const { name, ownedByAccount, image } = space || {}
  const { backersCount, total } = info || {}

  const owner = ownedByAccount?.id

  const {
    title,
    inputLabel,
    balanceLabel,
    modalButton,
    actionButton,
    amountInput,
  } = modalData[modalVariant]

  const totalValue = (
    <FormatBalance
      value={total || '0'}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const desc = (
    <>
      {pluralize({
        count: backersCount || '0',
        singularText: 'staker',
      })}{' '}
      · {totalValue} staked
    </>
  )

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
        <CreatorPreview
          title={name}
          desc={desc}
          imgSize={isMobile ? 60 : 80}
          avatar={image}
          owner={owner}
          titleClassName='ml-2 mb-3 text-2xl'
          descClassName='text-base ml-2 text-text-muted leading-5'
        />
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
        <StakingTxButton
          amount={amount}
          decimal={decimal}
          spaceId={spaceId}
          label={modalButton}
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
