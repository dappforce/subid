import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import StakeActionButtons from '../StakeActionButtons'
import StakingModal, { StakingModalVariant } from './StakeModal'
import { useState } from 'react'
import { useEraStakesById } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { pluralize } from '@subsocial/utils'
import { FormatBalance } from 'src/components/common/balances'
import { useGetDecimalsAndSymbolByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'
import { CreatorPreview } from '../../utils/CreatorPreview'

type AboutModalProps = {
  open: boolean
  closeModal: () => void
  spaceId: string
  isStake: boolean
}

const AboutModal = ({
  open,
  closeModal,
  spaceId,
  isStake,
}: AboutModalProps) => {
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)
  const generalEraInfo = useGeneralEraInfo()
  const { decimal, tokenSymbol } = useGetDecimalsAndSymbolByNetwork('subsocial')

  const { currentEra } = generalEraInfo || {}

  const eraStake = useEraStakesById(spaceId, currentEra)
  const [ openStakeModal, setOpenStakeModal ] = useState(false)
  const [ modalVariant, setModalVariant ] = useState<StakingModalVariant>('stake')

  const { space } = creatorSpaceEntity || {}
  const { info } = eraStake || {}

  const { name, ownedByAccount, image, about } = space || {}
  const { numberOfStakers, total } = info || {}

  const owner = ownedByAccount?.id

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

  return (
    <>
      <Modal
        isOpen={open}
        withFooter={false}
        title={'ℹ️ About'}
        withCloseButton
        closeModal={() => {
          closeModal()
        }}
      >
        <div className='flex flex-col gap-6'>
          <CreatorPreview
            title={name}
            desc={desc}
            imgSize={80}
            avatar={image}
            owner={owner}
            titleClassName='ml-2 mb-4 text-2xl'
            descClassName='text-base ml-2 text-text-muted leading-5'
          />

          <div className='flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl'>
            <div className='text-text-muted text-sm'>Description</div>
            <div className='max-h-48 overflow-y-auto'>{about}</div>
          </div>

          <StakeActionButtons
            spaceId={spaceId}
            isStake={isStake}
            buttonsSize='lg'
            openModal={() => setOpenStakeModal(true)}
            setModalVariant={setModalVariant}
            onClick={() => closeModal()}
          />
        </div>
      </Modal>
      <StakingModal
        open={openStakeModal}
        closeModal={() => setOpenStakeModal(false)}
        spaceId={spaceId}
        modalVariant={modalVariant}
      />
    </>
  )
}

export default AboutModal
