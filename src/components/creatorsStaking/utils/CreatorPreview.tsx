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
}: CreatorPreviewProps) => {
  return (
    <div className='flex items-center'>
      <BaseAvatar
        style={{ cursor: 'pointer' }}
        size={imgSize}
        address={owner}
        avatar={avatar}
      />
      <div className={infoClassName}>
        <div className={clsx('leading-5 font-medium', titleClassName)}>
          {title || '<Unnamed>'}
        </div>
        {desc && <div className={descClassName}>{desc}</div>}
      </div>
    </div>
  )
}