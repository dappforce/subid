import { useStakingContext } from 'src/components/staking/collators/StakingContext'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import BN from 'bignumber.js'
import { useEffect } from 'react'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchGeneralEraInfo } from '../../../rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import { SubDate } from '@subsocial/utils'
import Skeleton from '../tailwind-components/Skeleton'

export const useGetDecimalsAndSymbolByNetwork = (network: string) => {
  const chainsInfo = useChainInfo()

  const chainInfo = chainsInfo?.[network]

  const { tokenDecimals, tokenSymbols, nativeToken } = chainInfo || {}

  const tokenSymbol = tokenSymbols?.[0] || nativeToken

  const decimal = tokenDecimals?.[0] || 0

  return { decimal, tokenSymbol }
}

export const useGetNextEraTime = (blockNumber?: string) => {
  const { currentTimestamp, currentBlockNumber, blockTime } = useStakingContext()
  
  if(!currentBlockNumber || !currentTimestamp || !blockTime || !blockNumber) return BIGNUMBER_ZERO
  
  const nextEraTime = new BN(blockNumber)
  .minus(currentBlockNumber)
  .multipliedBy(blockTime)
  .plus(currentTimestamp)
  
  return nextEraTime
}

export const NextEraStartDate = () => {
  const generalEraInfo = useGeneralEraInfo()

  const { nextEraBlock } = generalEraInfo || {}

  const nextEraTime = useGetNextEraTime(nextEraBlock)
  const { currentBlockNumber } = useStakingContext()
  const dispatch = useAppDispatch()

  const currentDate = new Date().getTime()

  useEffect(() => {
    fetchGeneralEraInfo(dispatch)
  }, [ currentDate >= nextEraTime.plus(3000).toNumber() ])

  if(!nextEraTime) return <>-</>

  return (
    <span>
      {!currentBlockNumber || currentBlockNumber?.isZero() ||
      new BN(currentDate.toString()).gt(nextEraTime) ? (
        <Skeleton className='w-24 h-[16px]' />
      ) : (
        SubDate.formatDate(nextEraTime.toNumber())
      )}
    </span>
  )
}