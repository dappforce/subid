import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import { CreatorPreview } from '../CreatorCard'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { StakeOrIncreaseStakeAmountInput, UnstakeAmountInput } from './AmountInput'
import { useEffect, useState } from 'react'
import { useStakerInfo } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { useGetDecimalsAndSymbolByNetwork } from '../../utils'
import { FormatBalance } from 'src/components/common/balances'
import {
  CommonTxButtonProps,
  StakeOrIncreaseTxButton,
  UnstakeTxButton,
} from './TxButtons'
import Button from '../../tailwind-components/Button'
import { openNewWindow } from 'src/components/utils'
import { twitterShareUrl } from 'src/components/urls/social-share'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { useEraStakesById } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { pluralize } from '@subsocial/utils'

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

const twitterText = 'I just staked on @SubIDapp!\nYou can try it here:'

export type StakingModalVariant =
  | 'stake'
  | 'unstake'
  | 'increaseStake'
  | 'success'

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
  success: {
    title: '🎉 Success',
    inputLabel: '',
    balanceLabel: '',
    modalButton: '',
    amountInput: () => null,
    actionButton: (_props: CommonTxButtonProps) => (
      <Button
        variant={'primary'}
        className='w-full'
        onClick={() => openNewWindow(twitterShareUrl('/creators', twitterText))}
      >
        Tweet about it!
      </Button>
    ),
  },
}

type StakeModalProps = {
  closeModal: () => void
  open: boolean
  spaceId: string
  modalVariant: StakingModalVariant
  setModalVariant?: (variant: StakingModalVariant) => void
}

const StakingModal = ({
  open,
  closeModal,
  spaceId,
  modalVariant,
  setModalVariant,
}: StakeModalProps) => {
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)
  const [ amount, setAmount ] = useState('0')
  const [ inputError, setInputError ] = useState<string | undefined>(undefined)

  useEffect(() => {
    if(open) {
      setAmount('0')
      inputError && setInputError(undefined)
    }
  }, [open])

  const generalEraInfo = useGeneralEraInfo()
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')

  const { currentEra } = generalEraInfo || {}

  const eraStake = useEraStakesById(spaceId, currentEra)

  const { space } = creatorSpaceEntity || {}
  const { info } = eraStake || {}

  const { name, ownedByAccount, image } = space || {}
  const { numberOfStakers, total } = info || {}

  const owner = ownedByAccount?.id

  const { title, inputLabel, balanceLabel, modalButton, actionButton, amountInput } =
    modalData[modalVariant]

  const totalValue = (
    <FormatBalance
      value={total}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const desc = (
    <>
      {pluralize({
        count: numberOfStakers || '0',
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
      <div className='flex flex-col gap-6'>
        {modalVariant === 'success' ? (
          <>
            <CreatorPreview
              title={name || '<Unnamed>'}
              desc={<>My stake: 100 SOON</>}
              imgSize={80}
              avatar={image}
              owner={owner}
              titleClassName='ml-2 mb-4 text-2xl'
              descClassName='text-base ml-2 text-text-muted leading-5'
            />
          </>
        ) : (
          <>
            <CreatorPreview
              title={name || '<Unnamed>'}
              desc={desc}
              imgSize={80}
              avatar={image}
              owner={owner}
              titleClassName='ml-2 mb-4 text-2xl'
              descClassName='text-base ml-2 text-text-muted leading-5'
            />
            {modalVariant === 'increaseStake' && (
              <CurrentStake spaceId={spaceId} />
            )}
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
            />
          </>
        )}
        <StakingTxButton
          amount={amount}
          decimal={decimal}
          spaceId={spaceId}
          label={modalButton}
          tokenSymbol={tokenSymbol}
          closeModal={closeModal}
          modalVariant={modalVariant}
          setModalVariant={setModalVariant}
          inputError={inputError}
        />
      </div>
    </Modal>
  )
}

export default StakingModal
