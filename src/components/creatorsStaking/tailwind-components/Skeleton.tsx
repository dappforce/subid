import clsx from 'clsx'
import { ComponentProps } from 'react'

type SkeletonProps = ComponentProps<'div'> & {
  className?: string
}

const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div {...props} role='status' className={clsx('animate-pulse', className)}>
      <div className={clsx('bg-gray-200 rounded-full opacity-60', className)}></div>
    </div>
  )
}

export default Skeleton
