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
import { formatTime, useGetOneEraTime } from '../utils/DaysToWithdraw'
import { useCalculateApr } from './calculateApr'

const skeletonClassName = 'h-[20px] mb-1'

const TimeInEra = () => {
  const timeInEra = useGetOneEraTime()
  if (!timeInEra) return <>-</>

  return <>{formatTime(timeInEra?.toNumber())}</>
}

const StatsCards = () => {
  const generalEraInfo = useGeneralEraInfo()
  const apr = useCalculateApr()

  const { info, loading } = generalEraInfo || {}

  const dashboardData = [
    {
      title: 'Total Staked',
      value: <TotalStakedBalance value={info?.staked || 0} loading={loading} />,
      infoTitle: 'The total amount of tokens staked on the Subsocial network',
    },
    {
      title: 'Estimated APR',
      value: (
        <ValueOrSkeleton
          value={apr && `${apr.toFixed(2)}%`}
          skeletonClassName={skeletonClassName}
        />
      ),
      infoTitle:
        'An estimate of how much your token balance will increase after a year of staking',
    },
    {
      title: 'Current Era',
      value: (
        <ValueOrSkeleton
          value={info?.currentEra}
          skeletonClassName={skeletonClassName}
        />
      ),
      desc: (
        <span className='flex normal:items-center items-start normal:flex-row flex-col gap-1'>
          <span>Next era</span>
          <NextEraStartDate />
        </span>
      ),
      infoTitle: (
        <>
          Rewards are available at the end of each era, which last <TimeInEra />
        </>
      ),
    },
    {
      title: 'Total Stakers',
      value: (
        <ValueOrSkeleton
          value={info?.backerCount}
          skeletonClassName={skeletonClassName}
          loading={loading}
        />
      ),
      infoTitle: 'The total number of unique accounts currently staking SUB',
    },
  ]

  return (
    <div className='grid md:grid-cols-4 grid-cols-2 md:gap-6 gap-4'>
      {dashboardData.map((data, i) => (
        <DashboardCard key={i} {...data} />
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
          <div className='text-4xl UnboundedFont'>Creator Staking Beta</div>
          <div className='text-[20px]'>
            An innovative way to stake for your favorite dapp and content
            creators
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
  )
}

export default Banner
