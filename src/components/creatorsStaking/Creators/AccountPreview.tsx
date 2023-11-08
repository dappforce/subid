import { pluralize } from '@subsocial/utils'
import clsx from 'clsx'
import { ContactInfo } from '../utils/socialLinks'
import { CreatorSpace } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesSlice'
import { CreatorPreview } from '../utils/CreatorPreview'
import { useResponsiveSize } from 'src/components/responsive'

type AccountPreviewProps = {
  space?: CreatorSpace
  spaceId: string
}

const AccountPreview = ({ space, spaceId }: AccountPreviewProps) => {
  const { isMobile } = useResponsiveSize()

  const { name, ownedByAccount, image, email, links, postsCount } = space || {}

  const contactInfo = { email, links }

  const owner = ownedByAccount?.id

  const postsLink = (
    <a
      href={`https://polkaverse.com/${spaceId}`}
      onClick={(e) => e.stopPropagation()}
      target='_blank'
      rel='noreferrer'
      className={clsx(
        'text-[#64748B] text-sm font-normal hover:text-text-primary leading-none duration-0'
      )}
    >
      {pluralize({ count: parseInt(postsCount || '0'), singularText: 'post' })}
    </a>
  )

  const accountDesc = (
    <div className='flex flex-col gap-2'>
      {!!postsCount && postsLink}
      <ContactInfo
        className={clsx('text-[#64748B]')}
        spaceId={spaceId}
        {...contactInfo}
      />
    </div>
  )

  return (
    <CreatorPreview
      title={name}
      imgSize={isMobile ? 60 : 80}
      desc={accountDesc}
      avatar={image}
      owner={owner}
      titleClassName='ml-2 mb-1 md:text-2xl text-xl'
      descClassName='text-base ml-2 text-text-muted leading-5 w-fit'
    />
  )
}

export default AccountPreview
