import clsx from 'clsx'
import Button from '../tailwind-components/Button'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import {
  useFetchGeneralEraInfo,
  useGeneralEraInfo,
} from '../../../rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { useCreatorsList } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { NextEraStartDate } from '../utils/NextEraStartDate'
import { StatsCard, TotalStakedBalance } from './utils'
import { useStakingConsts } from 'src/rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import BN from 'bignumber.js'
import { useMemo } from 'react'

const skeletonClassName = 'w-28 h-[20px] mb-1'

const StatsCards = () => {
  const generalEraInfo = useGeneralEraInfo()
  const creatorsList = useCreatorsList()
  const stakingConsts = useStakingConsts()

  const { currentAnnualInflation } = stakingConsts || {}

  const apr = useMemo(() => {
    if (!currentAnnualInflation) return undefined

    return new BN(currentAnnualInflation).dividedBy(2).toString()
  }, [ currentAnnualInflation ])

  const creatorsCount = creatorsList?.length

  const dashboardData = [
    {
      title: 'Total Staked',
      value: <TotalStakedBalance value={generalEraInfo?.staked || 0} />,
    },
    {
      title: 'Estimated APR',
      value: (
        <ValueOrSkeleton
          value={apr ? `${apr}%` : undefined}
          skeletonClassName={skeletonClassName}
        />
      ),
    },
    {
      title: 'Current Era',
      value: (
        <ValueOrSkeleton
          value={generalEraInfo?.currentEra}
          skeletonClassName={skeletonClassName}
        />
      ),
      desc: (
        <span className='flex md:items-center items-start md:flex-row flex-col gap-1'>
          <span>Next era</span>
          <NextEraStartDate />
        </span>
      ),
    },
    {
      title: 'Total Creators',
      value: (
        <ValueOrSkeleton
          value={creatorsCount}
          skeletonClassName={skeletonClassName}
        />
      ),
    },
  ]

  return (
    <div className='grid md:grid-cols-4 grid-cols-2 md:gap-6 gap-4'>
      {dashboardData.map((data, i) => (
        <StatsCard key={i} {...data} />
      ))}
    </div>
  )
}

const Banner = () => {
  useFetchGeneralEraInfo()

  return (
    <div
      className={clsx(
        'bg-staking-bg bg-no-repeat bg-cover',
        'w-full flex gap-6 flex-col md:p-6 p-4 rounded-[20px]'
      )}
    >
      <div className='flex md:flex-row gap-6 flex-col justify-between md:items-start items-center w-full'>
        <div className='flex flex-col gap-2 text-white md:items-start items-center'>
          <div className='text-4xl UnboundedFont'>Create2Earn</div>
          <div className='text-[20px]'>An innovative way to stake</div>
        </div>

        <Button variant='white' size='sm' href='google.com'>
          <span className='flex gap-2 items-center py-1'>
            <AiOutlineQuestionCircle size={20} /> How does it work?
          </span>
        </Button>
      </div>
      <StatsCards />
    </div>
  )
}

export default Banner
