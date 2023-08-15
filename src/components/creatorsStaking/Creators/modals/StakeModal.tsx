import Modal from '../../tailwind-components/Modal'
import { CreatorPreview } from '../CreatorCard'

type StakeModalProps = {
  closeModal: () => void
  open: boolean
}

const StakeModal = ({ open, closeModal }: StakeModalProps) => {
  return (
    <Modal
      isOpen={open}
      withFooter={false}
      title={'🌟 Stake'}
      withCloseButton
      closeModal={() => {
        closeModal()
      }}
    >
      <div>
      <CreatorPreview 
        title={'Elon Musk'} 
        desc='2,794 stakers · 7,320.45 SUB staked' 
        imgSize={80}
        avatar='/images/creator-staking/tmp-image.png'
        titleClassName='ml-2 mb-4 text-2xl'
        descClassName='text-base ml-2 text-text-muted leading-5'
        />
      </div>
    </Modal>
  )
}

export default StakeModal
