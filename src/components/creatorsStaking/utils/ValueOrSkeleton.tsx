import Skeleton from '../tailwind-components/Skeleton'

type ValueOrSkeleton = {
  value?: React.ReactNode
  loading?: boolean
  skeletonClassName?: string
}

const ValueOrSkeleton = ({ value, loading, skeletonClassName }: ValueOrSkeleton) => {
  if(!value || loading) return <Skeleton className={skeletonClassName} />

  if(!value) return <>-</>

  return (
    <span>{value}</span>
  )
}

export default ValueOrSkeleton