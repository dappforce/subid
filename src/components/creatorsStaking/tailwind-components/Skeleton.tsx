import clsx from 'clsx'

type SkeletonProps = {
  className?: string
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div role='status' className='max-w-sm animate-pulse'>
      <div className={clsx('bg-gray-200 rounded-full opacity-60', className)}></div>
    </div>
  )
}

export default Skeleton
