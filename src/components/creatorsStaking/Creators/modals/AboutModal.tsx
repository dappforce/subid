import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import { CreatorPreview } from '../CreatorCard'
import StakeActionButtons from '../StakeButton'
import StakingModal, { StakingModalVariant } from './StakeModal'
import { useState } from 'react'

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
  const [ openStakeModal, setOpenStakeModal ] = useState(false)
  const [ modalVariant, setModalVariant ] = useState<StakingModalVariant>('stake')

  const { space } = creatorSpaceEntity || {}

  const { name, ownedByAccount, image, about } = space || {}

  const owner = ownedByAccount?.id

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
            title={name || '<Unnamed>'}
            desc='2,794 stakers · 7,320.45 SUB staked'
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
