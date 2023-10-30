import { useMemo } from 'react'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import BN from 'bignumber.js'
import { convertToBalanceWithDecimal } from '@subsocial/utils'
import { useGetDecimalsAndSymbolByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'

const blockReward = new BN(6)
const eraReward = blockReward.multipliedBy(new BN(7200))
const annualReward = eraReward.multipliedBy(new BN(365))
const backerPercent = new BN(0.6)

export const useCalculateApr = () => {
  const generalEraInfo = useGeneralEraInfo()
  const { decimal } = useGetDecimalsAndSymbolByNetwork('subsocial')

  const { info, loading } = generalEraInfo || {}

  const apr = useMemo(() => {
    if (!info || loading) return

    const totalStakedWithDecimal = convertToBalanceWithDecimal(
      info.staked,
      decimal
    )

    return annualReward
      .dividedBy(totalStakedWithDecimal)
      .multipliedBy(backerPercent)
      .multipliedBy(100)
  }, [ info?.staked || 0 ])

  return apr
}
