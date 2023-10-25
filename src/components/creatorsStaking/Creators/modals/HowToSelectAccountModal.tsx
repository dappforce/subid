import Modal from '../../tailwind-components/Modal'
import Button from '../../tailwind-components/Button'

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
      <div className={'flex flex-col items-center gap-6 mt-6'}>
        <img
          src={'/images/creator-staking/choose-account.gif'}
          alt=''
          height={299}
          width={330}
          className='rounded-2xl'
        />
        <div className='text-text-muted text-base'>
          To select a specific account, click on &quot;All Accounts&quot; in the
          top right corner, and choose which account you would like to use from
          the dropdown menu.
        </div>
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
