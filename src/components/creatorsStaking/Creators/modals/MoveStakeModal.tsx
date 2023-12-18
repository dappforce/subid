import { useEffect, useMemo, useState } from 'react'
import Modal from '../../tailwind-components/Modal'
import SelectInput, {
  ListItem,
} from '../../tailwind-components/inputs/SelectInput'
import { useGetMyCreatorsIds } from '../../hooks/useGetMyCreators'
import { useCreatorsList } from '@/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { useCreatorSpaceById } from '@/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import BaseAvatar from '@/components/utils/DfAvatar'
import { AmountInput } from './AmountInput'
import { useBackerInfo } from '@/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { FormatBalance } from '@/components/common/balances'
import { useGetDecimalsAndSymbolByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import { MoveStakeTxButton } from './TxButtons'
import {
  balanceWithDecimal,
  convertToBalanceWithDecimal,
} from '@subsocial/utils'
import { BIGNUMBER_ZERO } from '@/config/app/consts'
import BN from 'bignumber.js'
import UserIcon from '@/assets/icons/user-icon.svg'
import { useRouter } from 'next/router'

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
  const myAddress = useMyAddress()
  const creatorsList = useCreatorsList()
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')
  const router = useRouter()

  const spaceIds = creatorsList?.map((item) => item.creator.spaceId)
  const myCreatorsIds = useGetMyCreatorsIds(spaceIds)

  const [ creatorFrom, setCreatorFrom ] = useState<ListItem>({
    id: defaultCreatorFrom,
    label: <ItemLabel spaceId={defaultCreatorFrom} />,
  })
  const [ creatorTo, setCreatorTo ] = useState<ListItem>()

  const bakerInfoFrom = useBackerInfo(creatorFrom.id, myAddress)
  const backerInfoTo = useBackerInfo(creatorTo?.id, myAddress)

  const [ amount, setAmount ] = useState<string>('')
  const [ inputError, setInputError ] = useState<string>()

  useEffect(() => {
    setCreatorFrom({
      id: defaultCreatorFrom,
      label: <ItemLabel spaceId={defaultCreatorFrom} />,
    })

    setCreatorTo(undefined)
    setAmount('')
    setInputError(undefined)
  }, [ open ])

  useEffect(() => {
    if (creatorFrom.id === creatorTo?.id) {
      setCreatorTo(undefined)
    }
  }, [ creatorFrom.id, creatorTo?.id ])

  const cretorsToSpaceIds = spaceIds?.filter((item) => item !== creatorFrom.id)

  const { info: infoFrom } = bakerInfoFrom || {}

  const { totalStaked: myStakeFrom } = infoFrom || {}

  const { info: infoTo } = backerInfoTo || {}

  const { totalStaked: myStakeTo } = infoTo || {}

  const showWarning = useMemo(() => {
    if (!myStakeFrom || !amount) return false

    const amountWithDecimal = balanceWithDecimal(amount, decimal)

    return amountWithDecimal.eq(new BN(myStakeFrom))
  }, [ amount, myStakeFrom ])

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
    const maxAmount =
      decimal && myStakeFrom
        ? convertToBalanceWithDecimal(myStakeFrom, decimal)
        : BIGNUMBER_ZERO

    setAmount(maxAmount.toString())
    validateInput(maxAmount.toString())
  }

  const validateInput = (amountValue: string) => {
    const amountWithDecimals = balanceWithDecimal(amountValue, decimal || 0)

    if (amountWithDecimals.gt(new BN(myStakeFrom || '0'))) {
      setInputError('Amount must be less than or equal to your stake')
    } else if (amountWithDecimals.lte(new BN(0))) {
      setInputError('Amount must be greater than 0')
    } else {
      setInputError(undefined)
    }
  }

  return (
    <Modal
      key={'move-stake-modal'}
      isOpen={open}
      withFooter={false}
      title={'🌟 Move Stake'}
      withCloseButton
      closeModal={() => {
        const query = router.query

        if (query.creator) {
          router.replace('/creators', '/creators', { scroll: false })
        }
        closeModal()
      }}
    >
      <div className='flex flex-col md:gap-6 gap-4'>
        <SelectInput
          selected={creatorFrom}
          setSelected={setCreatorFrom}
          fieldLabel='From'
          items={creatorFromItems}
          className='bg-[#FAFBFF]'
          rightLabelItem={
            <div className='flex items-center gap-1'>
              My Stake:
              <div className='text-black font-bold'>
                <FormatBalance
                  value={myStakeFrom}
                  decimals={decimal}
                  currency={tokenSymbol}
                  isGrayDecimal={false}
                />
              </div>
            </div>
          }
        />
        <SelectInput
          selected={creatorTo}
          setSelected={setCreatorTo}
          placeholder={
            <div className='flex items-center gap-2 text-slate-400 text-base font-normal'>
              <UserIcon />
              <span>Select a different creator to stake to</span>
            </div>
          }
          fieldLabel='To'
          className='bg-[#FAFBFF]'
          rightLabelItem={
            creatorTo && (
              <div className='flex items-center gap-1'>
                My Stake:
                <div className='text-black font-bold'>
                  <FormatBalance
                    value={myStakeTo}
                    decimals={decimal}
                    currency={tokenSymbol}
                    isGrayDecimal={false}
                  />
                </div>
              </div>
            )
          }
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
            className='!bg-[#FAFBFF]'
          />
        )}

        {showWarning && (
          <div className='px-4 py-2 bg-indigo-50 text-text-primary rounded-[20px]'>
            ℹ️ Moving your entire stake to a new creator will end your stake
            with the other creator.
          </div>
        )}
        <MoveStakeTxButton
          decimal={decimal}
          amount={amount}
          spaceIdFrom={creatorFrom.id}
          spaceIdTo={creatorTo?.id}
          closeModal={closeModal}
        />
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
