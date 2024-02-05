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
import {
  useCreatorRewards,
  useFetchCreatorRewards,
} from '../../../rtk/features/creatorStaking/creatorRewards/creatorRewardsHooks'
import { isEmptyArray } from '@subsocial/utils'
import { toGenericAccountId } from '@/rtk/app/util'

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

  const creators = creatorsList?.filter(
    (item) => toGenericAccountId(item.creator.stakeholder) === myAddress
  )

  useFetchCreatorRewards(
    myAddress,
    creators?.map((item) => item.id)
  )

  const backerRewards = useBackerRewards(myAddress)
  const creatorRewards = useCreatorRewards(myAddress)

  const { data: creatorRewardsData, loading: creatorRewardsLoading } =
    creatorRewards || {}
  const { data: backerRewardsData, loading: backerRewardsLoading } =
    backerRewards || {}

  const { rewards: creatorRewardsValue, availableClaims: creatorClaimsCount } =
    creatorRewardsData || {}
  const { rewards, availableClaimsBySpaceId: backerClaimsCount } =
    backerRewardsData || {}

  const { totalRewards } = rewards || {}

  const creatorRewardsBN = new BN(creatorRewardsValue || '0')
  const stakerRewardsBN = new BN(totalRewards || '0')

  if (creatorRewardsBN.isZero() && stakerRewardsBN.isZero()) return null

  const isCreatorRewards = !isEmptyArray(Object.keys(creatorClaimsCount || {}))

  const myRewardsValue = (
    <FormatBalance
      value={
        isCreatorRewards
          ? creatorRewardsBN.toString()
          : stakerRewardsBN.toString()
      }
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
    />
  )

  const myRewards = (
    <ValueOrSkeleton
      value={myRewardsValue}
      loading={isCreatorRewards ? creatorRewardsLoading : backerRewardsLoading}
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
          You have {isCreatorRewards ? 'creators' : 'staking'} rewards of{' '}
          <span className='font-semibold'>{myRewards}</span> available to claim:
        </div>
        <ClaimRewardsTxButton
          rewardsSpaceIds={Object.keys(backerClaimsCount || {}) || []}
          totalRewards={
            isCreatorRewards
              ? creatorRewardsBN.toString()
              : stakerRewardsBN.toString()
          }
          backerClaimsCount={backerClaimsCount}
          creatorClaimsCount={creatorClaimsCount}
          restake={false}
          label={<>Claim {myRewards}</>}
        />
      </div>
    </div>
  )
}

export default ClaimSection
