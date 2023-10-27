import clsx from 'clsx'
import BaseAvatar from 'src/components/utils/DfAvatar'

type CreatorPreviewProps = {
  title?: React.ReactNode
  imgSize?: number
  desc?: React.ReactNode
  owner?: string
  avatar?: string
  titleClassName?: string
  descClassName?: string
  infoClassName?: string
  titleRef?: React.RefObject<HTMLDivElement>
}

export const CreatorPreview = ({
  desc,
  imgSize = 40,
  avatar,
  owner,
  title,
  titleClassName,
  descClassName,
  infoClassName,
  titleRef
}: CreatorPreviewProps) => {
  return (
    <div className='flex w-full items-center overflow-hidden'>
      <BaseAvatar
        style={{ cursor: 'pointer' }}
        size={imgSize}
        address={owner}
        avatar={avatar}
      />
      <div className={clsx('w-full overflow-hidden', infoClassName)}>
        <div ref={titleRef} className={clsx('w-full font-medium overflow-hidden overflow-ellipsis', titleClassName)}>
          {title || '<Unnamed>'}
        </div>
        {desc && <div className={descClassName}>{desc}</div>}
      </div>
    </div>
  )
}
