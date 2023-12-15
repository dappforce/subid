import clsx from 'clsx'
import Button from '../tailwind-components/Button'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import {
  useFetchGeneralEraInfo,
  useGeneralEraInfo,
} from '../../../rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { NextEraStartDate } from '../utils/NextEraStartDate'
import { DashboardCard, TotalStakedBalance } from './utils'
import { useCalculateApr } from './calculateApr'
import { useMemo } from 'react'

const skeletonClassName = 'h-[20px] mb-1'

const Apr = () => {
  const apr = useCalculateApr()

  return (
    <ValueOrSkeleton
      value={apr && `${apr.toFixed(2)}%`}
      skeletonClassName={skeletonClassName}
    />
  )
}

const StatsCards = () => {
  const generalEraInfo = useGeneralEraInfo()

  const { info, loading } = generalEraInfo ?? {}

  const stakedBalance = info?.staked ?? 0

  const dashboardData = useMemo(
    () => [
      {
        title: 'Total Staked',
        value: <TotalStakedBalance value={stakedBalance} loading={loading} />,
        infoTitle: 'The total amount of tokens staked on the Subsocial network',
      },
      {
        title: 'Estimated APR',
        value: <Apr />,
        infoTitle:
          'An estimate of how much your token balance will increase after a year of staking, regardless of which creator you stake to',
      },
      {
        title: 'Next Rewards',
        value: <NextEraStartDate />,
        infoTitle: (
          <>Time until the next round of rewards is available to claim.</>
        ),
      },
      {
        title: 'Total Stakers',
        value: (
          <ValueOrSkeleton
            value={info?.backerCount}
            skeletonClassName={skeletonClassName}
          />
        ),
        infoTitle: 'The total number of unique accounts currently staking SUB',
      },
    ],
    [ stakedBalance, info?.currentEra, info?.backerCount ]
  )

  return (
    <div className='grid md:grid-cols-4 grid-cols-2 md:gap-6 gap-4'>
      {dashboardData.map((data) => (
        <DashboardCard key={data.title} {...data} />
      ))}
    </div>
  )
}

const Banner = () => {
  useFetchGeneralEraInfo()

  return (
    <div className='md:!mx-4 mx-0'>
      <div
        className={clsx(
          'sm:bg-staking-bg bg-staking-bg-mobile bg-no-repeat bg-cover',
          'w-full flex gap-6 flex-col md:p-6 p-4 rounded-[20px] md:rounded-t-[20px] rounded-t-none'
        )}
      >
        <div className='flex md:flex-row gap-6 flex-col justify-between md:items-start items-center w-full'>
          <div className='flex flex-col gap-2 text-white md:items-start items-center'>
            <div className='text-4xl md:text-left text-center UnboundedFont'>
              Creator Staking Beta
            </div>
            <div className='text-[20px] md:text-left text-center'>
              Generate rewards for both you and creators by staking SUB towards them
            </div>
          </div>

          <Button
            variant='white'
            size='sm'
            target='_blank'
            href='https://docs.subsocial.network/docs/basics/staking/overview'
          >
            <span className='flex gap-2 items-center py-1'>
              <AiOutlineQuestionCircle size={20} /> How does it work?
            </span>
          </Button>
        </div>
        <StatsCards />
      </div>
    </div>
  )
}

export default Banner
