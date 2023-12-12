import { useState } from 'react'
import Modal from '../../tailwind-components/Modal'
import SelectInput, {
  ListItem,
} from '../../tailwind-components/inputs/SelectInput'
import { useGetMyCreatorsIds } from '../../hooks/useGetMyCreators'
import { useCreatorsList } from '@/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { useCreatorSpaceById } from '@/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import BaseAvatar from '@/components/utils/DfAvatar'
import { AmountInput } from './AmountInput'

type MoveStakeModalProps = {
  open: boolean
  closeModal: () => void
  defaultCreatorFrom: string
}

const MoveStakeModal = ({
  open,
  closeModal,
  defaultCreatorFrom,
}: MoveStakeModalProps) => {
  const creatorsList = useCreatorsList()

  const spaceIds = creatorsList?.map((item) => item.creator.spaceId)
  const myCreatorsIds = useGetMyCreatorsIds(spaceIds)

  const [creatorFrom, setCreatorFrom] = useState<ListItem>({
    id: defaultCreatorFrom,
    label: <ItemLabel spaceId={defaultCreatorFrom} />,
  })
  const [creatorTo, setCreatorTo] = useState<ListItem>()
  const [amount, setAmount] = useState<string>('')
  const [inputError, setInputError] = useState<string>()

  const cretorsToSpaceIds = spaceIds?.filter((item) => item !== creatorFrom.id)

  const creatorFromItems: ListItem[] = myCreatorsIds?.map((item) => {
    return {
      id: item,
      label: <ItemLabel spaceId={item} />,
    }
  })

  const creatorToItems: ListItem[] = (cretorsToSpaceIds || [])?.map((item) => {
    return {
      id: item,
      label: <ItemLabel spaceId={item} />,
    }
  })

  const onMaxAmountClick = () => {
    console.log('maxAmountClick')
  }

  const validateInput = () => {
    console.log('validateInput')
  }

  return (
    <Modal
      isOpen={open}
      withFooter={false}
      title={'🌟 Move Stake'}
      withCloseButton
      closeModal={() => {
        closeModal()
      }}
    >
      <div className='flex flex-col md:gap-6 gap-4'>
        <SelectInput
          selected={creatorFrom}
          setSelected={setCreatorFrom}
          fieldLabel='From'
          items={creatorFromItems}
        />
        <SelectInput
          selected={creatorTo}
          setSelected={setCreatorTo}
          placeholder='Select a different creator to stake to'
          fieldLabel='To'
          items={creatorToItems as ListItem[]}
        />
        {creatorTo && (
          <AmountInput
            amount={amount}
            setAmount={setAmount}
            inputError={inputError}
            setInputError={setInputError}
            label={'Staked SUB to move'}
            onMaxAmountClick={onMaxAmountClick}
            validateInput={validateInput}
          />
        )}
      </div>
    </Modal>
  )
}

type ItemLabelProps = {
  spaceId: string
}

const ItemLabel = ({ spaceId }: ItemLabelProps) => {
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)

  const { space } = creatorSpaceEntity || {}

  const { image, name, ownedByAccount } = space || {}

  return (
    <div className='flex items-center'>
      <BaseAvatar
        style={{ cursor: 'pointer' }}
        size={24}
        address={ownedByAccount?.id}
        avatar={image}
      />
      <div>{name}</div>
    </div>
  )
}

export default MoveStakeModal
