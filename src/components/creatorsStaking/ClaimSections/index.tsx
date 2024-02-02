import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import { useCreatorsList } from '@/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useGetMyCreatorsIds } from '../hooks/useGetMyCreators'
import { useMemo } from 'react'
import {
  useBackerRewards,
  useFetchBackerRewards,
} from '@/rtk/features/creatorStaking/backerRewards/backerRewardsHooks'
import ClaimRewardsTxButton from './ClaimRewardsTxButton'
import { FormatBalance } from '@/components/common/balances'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import BN from 'bignumber.js'
import NewStakingVersionSection from '../utils/NewStakingVersionSection'
import { useFetchBackerInfoBySpaces } from '@/rtk/features/creatorStaking/backerInfo/backerInfoHooks'

const ClaimSection = () => {
  const myAddress = useMyAddress()
  const creatorsList = useCreatorsList()
  const { decimal, tokenSymbol: symbol } = useGetChainDataByNetwork('subsocial')

  const creatorsSpaceIds = useMemo(
    () => creatorsList?.map((creator) => creator.id),
    [ creatorsList?.length ]
  )

  useFetchBackerInfoBySpaces(creatorsSpaceIds)

  const myCreatorsIds = useGetMyCreatorsIds(creatorsSpaceIds)

  useFetchBackerRewards(
    myAddress,
    myCreatorsIds.length ? myCreatorsIds : creatorsSpaceIds
  )
  const backerRewards = useBackerRewards(myAddress)

  const { data: rewardsData, loading: rewardsLoading } = backerRewards || {}

  const { rewards, availableClaimsBySpaceId } = rewardsData || {}

  const { totalRewards } = rewards || {}

  if (new BN(totalRewards || '0').isZero()) return null

  const myRewardsValue = (
    <FormatBalance
      value={totalRewards?.toString() || '0'}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
    />
  )

  const myRewards = (
    <ValueOrSkeleton
      value={myRewardsValue}
      loading={rewardsLoading}
      skeletonClassName='h-[24px]'
    />
  )

  return (
    <div className='flex flex-col gap-6'>
      <NewStakingVersionSection />

      <div className='flex flex-col items-center gap-6 bg-white rounded-[20px] md:p-6 p-4'>
        <div className='text-2xl font-semibold leading-[26px] text-slate-900'>
          👉 Next steps
        </div>
        <div className='text-slate-900 text-lg font-normal text-center leading-[26px]'>
          You have staking rewards of{' '}
          <span className='font-semibold'>{myRewards}</span> available to claim:
        </div>
        <ClaimRewardsTxButton
          rewardsSpaceIds={Object.keys(availableClaimsBySpaceId || {}) || []}
          totalRewards={totalRewards || '0'}
          availableClaimsBySpaceId={availableClaimsBySpaceId}
          restake={false}
          label={<>Claim {myRewards}</>}
        />
      </div>
    </div>
  )
}

export default ClaimSection
