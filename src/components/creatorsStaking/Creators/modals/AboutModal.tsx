import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import StakeActionButtons from '../StakeActionButtons'
import StakingModal, { StakingModalVariant } from './StakeModal'
import { useState } from 'react'
import { CreatorPreview } from '../../utils/CreatorPreview'
import { useResponsiveSize } from 'src/components/responsive'

type AboutModalProps = {
  open: boolean
  closeModal: () => void
  spaceId: string
  isStake: boolean
  amount: string
  setAmount: (amount: string) => void
}

const AboutModal = ({
  open,
  closeModal,
  spaceId,
  isStake,
  amount,
  setAmount,
}: AboutModalProps) => {
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)
  const { isMobile } = useResponsiveSize()

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
        <div className='flex flex-col md:gap-6 gap-4'>
          <CreatorPreview
            title={name}
            imgSize={isMobile ? 60 : 80}
            avatar={image}
            owner={owner}
            titleClassName='ml-2 md:mb-3 mb-2 md:text-2xl text-xl'
            descClassName='text-base ml-2 text-text-muted leading-5'
          />

          {about && (
            <div className='flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl'>
              <div className='text-text-muted text-sm'>Description</div>
              <div className='max-h-48 overflow-y-auto text-base'>{about}</div>
            </div>
          )}

          <StakeActionButtons
            spaceId={spaceId}
            isStake={isStake}
            buttonsSize='lg'
            openModal={() => setOpenStakeModal(true)}
            setModalVariant={setModalVariant}
            onClick={() => closeModal()}
            className='text-base'
          />
        </div>
      </Modal>
      <StakingModal
        open={openStakeModal}
        closeModal={() => setOpenStakeModal(false)}
        spaceId={spaceId}
        modalVariant={modalVariant}
        amount={amount}
        setAmount={setAmount}
      />
    </>
  )
}

export default AboutModal
