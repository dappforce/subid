import Skeleton from '../tailwind-components/Skeleton'

type ValueOrSkeleton = {
  value?: React.ReactNode
  loading?: boolean
  skeletonClassName?: string
  className?: string
}

const ValueOrSkeleton = ({
  value,
  loading,
  skeletonClassName,
  className
}: ValueOrSkeleton) => {
  if (!value || loading)
    return <Skeleton className={skeletonClassName} />

  if (!value) return <>-</>

  return <span className={className}>{value}</span>
}

export default ValueOrSkeleton
