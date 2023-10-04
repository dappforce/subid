import { useStakingContext } from 'src/components/staking/collators/StakingContext'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import BN from 'bignumber.js'
import { useEffect } from 'react'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchGeneralEraInfo } from '../../../rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { SubDate } from '@subsocial/utils'
import Skeleton from '../tailwind-components/Skeleton'
import { useGetNextEraTime } from '../hooks/useGetNextEraTime'
import {
  fetchStakerRewards,
  useStakerRewards,
} from 'src/rtk/features/creatorStaking/stakerRewards/stakerRewardsHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'

export const NextEraStartDate = () => {
  const generalEraInfo = useGeneralEraInfo()
  const myAddress = useMyAddress()
  const stakerRewards = useStakerRewards(myAddress)
  const { data: rewardsData } = stakerRewards || {}

  const { availableClaimsBySpaceId } = rewardsData || {}

  const { nextEraBlock } = generalEraInfo || {}

  const nextEraTime = useGetNextEraTime(nextEraBlock)
  const { currentBlockNumber } = useStakingContext()
  const dispatch = useAppDispatch()

  const currentDate = new Date().getTime()

  useEffect(() => {
    fetchGeneralEraInfo(dispatch)

    if (myAddress && availableClaimsBySpaceId) {
      fetchStakerRewards(
        dispatch,
        myAddress,
        Object.keys(availableClaimsBySpaceId)
      )
    }
  }, [ currentDate >= nextEraTime.plus(3000).toNumber() ])

  if (!nextEraTime) return <>-</>

  return (
    <span>
      {!currentBlockNumber ||
      currentBlockNumber?.isZero() ||
      new BN(currentDate.toString()).gt(nextEraTime) ? (
        <Skeleton className='w-24 h-[16px]' />
      ) : (
        SubDate.formatDate(nextEraTime.toNumber())
      )}
    </span>
  )
}
