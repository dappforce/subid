import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import { CreatorPreview } from '../../utils/CreatorPreview'
import { openNewWindow } from 'src/components/utils'
import { twitterShareUrl } from 'src/components/urls/social-share'
import Button from '../../tailwind-components/Button'
import { useResponsiveSize } from 'src/components/responsive'
import { MdInfo } from 'react-icons/md'
import clsx from 'clsx'

const twitterText =
  'I just staked my #SUB {creator_name} on @SubsocialChain\n\nYou can stake towards your favorite creators here:'

const getTwitterText = (links?: string[]) => {
  const twitterUsername = links
    ?.find((link) => link.includes('twitter'))
    ?.split('twitter.com/')
    .pop()
  return twitterText.replace(
    '{creator_name}',
    twitterUsername ? `to @${twitterUsername}` : ''
  )
}

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
  const { isMobile } = useResponsiveSize()
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)

  const { space } = creatorSpaceEntity || {}

  const { name, ownedByAccount, image, links } = space || {}
  const owner = ownedByAccount?.id

  const subModalContent = (
    <div
      className={clsx(
        'md:p-6 p-5 flex items-center justify-between gap-4 rounded-[20px]',
        'bg-indigo-50 text-text-primary text-base max-w-lg w-full'
      )}
    >
      <div className='flex gap-4 items-center text-start'>
        {!isMobile && (
          <div className='text-blue-400'>
            <MdInfo size={24} />
          </div>
        )}
        <div className='max-w-[260px]'>
          Earn more SUB based on your social activity.
        </div>
      </div>
      <div>
        <Button
          variant='primary'
          href='https://subsocial.network/active-staking-details'
          className='w-max md:!px-6 !px-4 text-sm'
          size='md'
        >
          Learn more
        </Button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={open}
      withFooter={false}
      title={'🎉 Success'}
      withCloseButton
      subModalContent={subModalContent}
      closeModal={() => {
        closeModal()
      }}
    >
      <div className='flex flex-col md:gap-6 gap-4'>
        <CreatorPreview
          title={name}
          desc={
            <span>
              My stake:{' '}
              <span className='font-bold text-black'>
                {amount} {tokenSymbol}
              </span>
            </span>
          }
          imgSize={isMobile ? 60 : 80}
          avatar={image}
          owner={owner}
          titleClassName='ml-2 mb-3 text-2xl'
          descClassName='text-base ml-2 text-text-muted leading-5'
        />
        <Button
          variant={'primary'}
          className='w-full'
          onClick={() =>
            openNewWindow(
              twitterShareUrl('/creators', getTwitterText(links), {
                tags: [
                  'CreatorEconomy',
                  'CreatorStaking',
                  'Subsocial',
                  'Web3Social',
                  'SocialFi',
                ],
              })
            )
          }
        >
          Tweet about it!
        </Button>
      </div>
    </Modal>
  )
}

export default SuccessModal
