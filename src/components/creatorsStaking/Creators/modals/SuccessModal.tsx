import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import { CreatorPreview } from '../../utils/CreatorPreview'
import { openNewWindow } from 'src/components/utils'
import { twitterShareUrl } from 'src/components/urls/social-share'
import Button from '../../tailwind-components/Button'

const twitterText = 'I just staked on @SubIDapp!\nYou can try it here:'

type SuccessModalProps = {
  open: boolean
  closeModal: () => void
  amount: string
  tokenSymbol: string
  spaceId: string
}

const SuccessModal = ({
  open,
  closeModal,
  amount,
  tokenSymbol,
  spaceId,
}: SuccessModalProps) => {
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)

  const { space } = creatorSpaceEntity || {}

  const { name, ownedByAccount, image } = space || {}

  const owner = ownedByAccount?.id

  return (
    <Modal
      isOpen={open}
      withFooter={false}
      title={'🎉 Success'}
      withCloseButton
      closeModal={() => {
        closeModal()
      }}
    >
      <div className='flex flex-col gap-6'>
        <CreatorPreview
          title={name}
          desc={
            <>
              My stake: {amount} {tokenSymbol}
            </>
          }
          imgSize={80}
          avatar={image}
          owner={owner}
          titleClassName='ml-2 mb-4 text-2xl'
          descClassName='text-base ml-2 text-text-muted leading-5'
        />
        <Button
          variant={'primary'}
          className='w-full'
          onClick={() =>
            openNewWindow(twitterShareUrl('/creators', twitterText))
          }
        >
          Tweet about it!
        </Button>
      </div>
    </Modal>
  )
}

export default SuccessModal
