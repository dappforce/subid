import { ComponentProps } from 'react'
import Skeleton from '../tailwind-components/Skeleton'

type ValueOrSkeleton = ComponentProps<'span'> & {
  value?: React.ReactNode
  loading?: boolean
  skeletonClassName?: string
  className?: string
}

const ValueOrSkeleton = ({
  value,
  loading,
  skeletonClassName,
  className,
  ...props
}: ValueOrSkeleton) => {
  if (!value || loading)
    return <Skeleton className={skeletonClassName} />

  if (!value) return <>—</>

  return <span {...props} className={className}>{value}</span>
}

export default ValueOrSkeleton
