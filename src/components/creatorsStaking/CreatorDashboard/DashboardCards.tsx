import { FormatBalance } from 'src/components/common/balances'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { useGetDecimalsAndSymbolByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'
import { useEraStakesByIds } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import DashboardCard from '../utils/DashboardCard'
import { CreatorsListEntity } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListSlice'
import { useMemo } from 'react'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import { isEmptyObj } from '@subsocial/utils'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useCreatorRewards } from 'src/rtk/features/creatorStaking/creatorRewards/creatorRewardsHooks'
import CreatorRewardsClaimButton from './CreatorsRewardsClaimButton'

type DashboardCardsProps = {
  creators: CreatorsListEntity[]
}

const DashboardCards = ({ creators }: DashboardCardsProps) => {
  const { decimal, tokenSymbol: symbol } =
    useGetDecimalsAndSymbolByNetwork('subsocial')
  const myAddress = useMyAddress()
  const creatorRewards = useCreatorRewards(myAddress)
  const eraInfo = useGeneralEraInfo()
  const era = eraInfo?.currentEra

  const spaceIds = creators.map((creator) => creator.id)
  
  const eraStakes = useEraStakesByIds(spaceIds, era)

  const { data, loading: creatorRewardsLoading } = creatorRewards || {}

  const { rewards } = data || {}

  const { total, backersCount } = useMemo(() => {
    if (!eraStakes) return {}

    let total = BIGNUMBER_ZERO
    let backersCount = 0

    Object.values(eraStakes).forEach((eraStake) => {
      const { total: totalStake, backersCount: stakeBackersCount } =
        eraStake || {}

      total = total.plus(totalStake)
      backersCount += parseInt(stakeBackersCount || '0')
    })

    return { total: total.toString(), backersCount }
  }, [ isEmptyObj(eraStakes), myAddress ])

  const stakedToMe = (
    <FormatBalance
      value={total || '0'}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
      withCurrency={false}
    />
  )

  const myRewards = (
    <FormatBalance
      value={rewards || '0'}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
      withCurrency={false}
    />
  )

  const cardsOpt = [
    {
      title: <>Staked To Me, {symbol}</>,
      value: (
        <ValueOrSkeleton
          value={stakedToMe}
          loading={!total}
          skeletonClassName='h-[24px]'
        />
      ),
    },
    {
      title: <>Estimated Rewards, {symbol}</>,
      value: (
        <ValueOrSkeleton
          value={myRewards}
          loading={creatorRewardsLoading}
          skeletonClassName='h-[24px]'
        />
      ),
      button: <CreatorRewardsClaimButton />,
    },
    {
      title: 'My Stakers',
      value: (
        <div className='font-semibold'>
          <ValueOrSkeleton
            value={backersCount || '0'}
            loading={backersCount === undefined}
            skeletonClassName='h-[24px]'
          />
        </div>
      ),
    },
  ]

  const stakingCards = cardsOpt.map((card, i) => (
    <DashboardCard key={i} {...card} />
  ))

  return (
    <div className='flex normal:flex-row flex-col gap-4'>{stakingCards}</div>
  )
}

export default DashboardCards
