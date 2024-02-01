import Modal from '../tailwind-components/Modal'
import Button from '../tailwind-components/Button'

type HowToSelectAccountModalProps = {
  open: boolean
  closeModal: () => void
  
}

const HowToSelectAccountModal = ({
  open,
  closeModal,
}: HowToSelectAccountModalProps) => {
  return (
    <Modal
      isOpen={open}
      withFooter={false}
      title={'ℹ️ How to select an account'}
      withCloseButton
      closeModal={() => {
        closeModal()
      }}
    >
      <div className={'flex flex-col items-center gap-6'}>
        <div className='text-text-muted text-base'>
          Sorry, but staking is only possible when using a single account.
          Here&apos;s how you can do it:
        </div>
        <img
          src={'/images/creator-staking/choose-account.gif'}
          alt=''
          height={299}
          width={330}
          className='rounded-2xl'
        />
        <Button
          variant='primaryOutline'
          className='w-100'
          size='lg'
          onClick={closeModal}
        >
          Got it!
        </Button>
      </div>
    </Modal>
  )
}

export default HowToSelectAccountModal
