import { useStakingContext } from 'src/components/staking/collators/StakingContext'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import BN from 'bignumber.js'
import { pluralize } from '@subsocial/utils'

export const formatTime = (seconds: number) => {
  const timeUnits = [
    { divisor: 86400, label: 'day' },
    { divisor: 3600, label: 'hour' },
    { divisor: 60, label: 'minute' },
    { divisor: 1, label: 'second' }
  ]

  for (const unit of timeUnits) {
    const { divisor, label } = unit

    if (seconds >= divisor) {
      const value = Math.floor(seconds / divisor)
      return pluralize({ count: value, singularText: label })
    }
  }
}

export const useGetOneEraTime = () => {
  const eraInfo = useGeneralEraInfo()
  const { blockTime } = useStakingContext()

  const { blockPerEra } = eraInfo?.info || {}

  const timeInEra =
    blockPerEra && blockTime
      ? new BN(blockPerEra).multipliedBy(new BN(blockTime).dividedBy(1000))
      : undefined

  return timeInEra
}

type DaysToUnstakeProps = {
  unbondingPeriodInEras?: string
}

const DaysToWithdraw = ({ unbondingPeriodInEras }: DaysToUnstakeProps) => {
  const timeInEra = useGetOneEraTime()

  const unbondingPeriodInDays = timeInEra?.multipliedBy(
    unbondingPeriodInEras || '0'
  )

  return <>{formatTime(unbondingPeriodInDays?.toNumber() || 0)}</>
}

export default DaysToWithdraw