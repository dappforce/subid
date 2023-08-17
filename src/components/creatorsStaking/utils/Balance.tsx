import Skeleton from '../tailwind-components/Skeleton'

type BalanceProps = {
  value: string | number
  symbol: string
  loading?: boolean
  skeletonClassName?: string
}

const Balance = ({ value, loading, symbol, skeletonClassName }: BalanceProps) => {

  if(!value || loading) return <Skeleton className={skeletonClassName} />

  return (
    <div>{value} {symbol}</div>
  )
}

export default Balance