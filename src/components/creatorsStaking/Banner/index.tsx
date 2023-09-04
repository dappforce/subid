import clsx from 'clsx'
import Button from '../tailwind-components/Button'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import CardWrapper from '../utils/CardWrapper'
import {
  useFetchGeneralEraInfo,
  useGeneralEraInfo,
} from '../../../rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { useCreatorsList } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { convertToBalanceWithDecimal, toShortMoney } from '@subsocial/utils'
import { NextEraStartDate } from '../utils'

type StatsCardProps = {
  title: string
  value: React.ReactNode
  desc?: React.ReactNode
}

const StatsCard = ({ title, value, desc }: StatsCardProps) => {
  return (
    <CardWrapper className='bg-background-stats-card/20 min-h-[116px] backdrop-blur-[24.5px]'>
      <div className='text-white/80'>{title}</div>
      <div>
        <div className='text-white text-2xl font-semibold'>{value}</div>
        {desc && <div className='text-white/80 text-sm'>{desc}</div>}
      </div>
    </CardWrapper>
  )
}

type SubsocialBalanceProps = {
  value: number | string
}

const SubsocialBalance = ({ value }: SubsocialBalanceProps) => {
  const chainsInfo = useChainInfo()

  const { tokenDecimals, tokenSymbols } = chainsInfo?.subsocial || {}

  const decimal = tokenDecimals?.[0]
  const symbol = tokenSymbols?.[0]

  if (!decimal || !symbol) return null

  const balanceWithDecimal = convertToBalanceWithDecimal(value, decimal)

  return (
    <ValueOrSkeleton
      value={<>{toShortMoney({ num: balanceWithDecimal.toNumber() })} {symbol}</>}
      skeletonClassName='w-28 h-[20px] mb-3'
      loading={!value}
    />
  )
}

const StatsCards = () => {
  const generalEraInfo = useGeneralEraInfo()
  const creatorsList = useCreatorsList()

  const creatorsCount = creatorsList?.length

  const dashboardData = [
    {
      title: 'Total Staked',
      value: <SubsocialBalance value={generalEraInfo?.staked || 0} />,
    },
    {
      title: 'Estimated APR',
      value: 'SOON',
    },
    {
      title: 'Current Era',
      value: <ValueOrSkeleton value={generalEraInfo?.currentEra} skeletonClassName='w-28 h-[20px] mb-1'/>,
      desc: <span className='flex items-center gap-1'>Next era<NextEraStartDate /></span>,
    },
    {
      title: 'Total Creators',
      value: <ValueOrSkeleton value={creatorsCount} skeletonClassName='w-28 h-[20px] mb-1'/>,
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
