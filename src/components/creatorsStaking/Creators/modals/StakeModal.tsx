import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import { CreatorPreview } from '../CreatorCard'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import AmountInput from './AmountInput'
import { useState } from 'react'
import { useStakerInfo } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { useGetDecimalsAndSymbolByNetwork } from '../../utils'
import {
  FormatBalance,
} from 'src/components/common/balances'
import { StakeOrIncreaseTxButton, UnstakeTxButton } from './TxButtons'

type CurrentStakeProps = {
  spaceId: string
}

const CurrentStake = ({ spaceId }: CurrentStakeProps) => {
  const myAddress = useMyAddress()
  const stakerInfo = useStakerInfo(spaceId, myAddress)
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')
  
  const { info } = stakerInfo || {}

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

type StakedValueProps = {
  spaceId: string
}

const StakedValue = ({ spaceId }: StakedValueProps) => {
  const myAddress = useMyAddress()
  const stakerInfo = useStakerInfo(spaceId, myAddress)
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')
  
  const { info } = stakerInfo || {}

  const { totalStaked } = info || {}

  const currentStake = (
    <FormatBalance
      value={totalStaked}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  return <>{currentStake}</>
}

export type StakingModalVariant = 'stake' | 'unstake' | 'increaseStake'

const modalData = {
  stake: {
    title: '🌟 Stake',
    inputLabel: 'Stake amount',
    balanceLabel: 'Balance',
    modalButton: 'Start staking',
    actionButton: StakeOrIncreaseTxButton
  },
  unstake: {
    title: '📤 Unstake',
    inputLabel: 'Amount',
    balanceLabel: 'Staked',
    modalButton: 'Unstake',
    actionButton: UnstakeTxButton
  },
  increaseStake: {
    title: '🌟 Increase Stake',
    inputLabel: 'Increase stake by',
    balanceLabel: 'Balance',
    modalButton: 'Increase',
    actionButton: StakeOrIncreaseTxButton
  },
}

type StakeModalProps = {
  closeModal: () => void
  open: boolean
  spaceId: string
  modalVariant: StakingModalVariant
}

const StakingModal = ({
  open,
  closeModal,
  spaceId,
  modalVariant,
}: StakeModalProps) => {
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')
  const [ amount, setAmount ] = useState('0')
  const [ inputError, setInputError ] = useState<string | undefined>(undefined)

  const { space } = creatorSpaceEntity || {}

  const { name, ownedByAccount, image } = space || {}

  const owner = ownedByAccount?.id

  const { title, inputLabel, balanceLabel, modalButton, actionButton } = modalData[modalVariant]

  const StakingTxButton = actionButton

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
      <div className='flex flex-col gap-6'>
        <CreatorPreview
          title={name || '<Unnamed>'}
          desc='2,794 stakers · 7,320.45 SUB staked'
          imgSize={80}
          avatar={image}
          owner={owner}
          titleClassName='ml-2 mb-4 text-2xl'
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
          balanceLabel={balanceLabel}
        />
        {modalVariant === 'unstake' && (
          <div className='px-4 py-2 bg-indigo-50 text-text-primary rounded-[20px]'>
            ℹ️ Unstaking takes about ten days before you can withdraw
          </div>
        )}
        <StakingTxButton 
          amount={amount} 
          decimal={decimal} 
          spaceId={spaceId} 
          label={modalButton}
          tokenSymbol={tokenSymbol}
          closeModal={closeModal}
        />
      </div>
    </Modal>
  )
}

export default StakingModal
