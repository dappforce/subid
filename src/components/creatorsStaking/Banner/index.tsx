import clsx from 'clsx'
import Button from '../tailwind-components/Button'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import CardWrapper from '../utils/CardWrapper'
import {
  useFetchGeneralEraInfo,
  useGeneralEraInfo,
} from '../../../rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { useCreatorsList } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import Balance from '../utils/Balance'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { convertToBalanceWithDecimal, toShortMoney } from '@subsocial/utils'

type StatsCardProps = {
  title: string
  value: React.ReactNode
  desc?: React.ReactNode
}

const StatsCard = ({ title, value, desc }: StatsCardProps) => {
  return (
    <CardWrapper className='bg-background-stats-card/20 backdrop-blur-[24.5px]'>
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
    <Balance
      value={toShortMoney({ num: balanceWithDecimal.toNumber() })}
      skeletonClassName='w-28 h-4 mb-3'
      symbol={symbol}
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
      desc: 'There can be your price)',
    },
    {
      title: 'Estimated APR',
      value: 'SOON',
    },
    {
      title: 'Current Era',
      value: generalEraInfo?.currentEra || 0,
      desc: 'SOON',
    },
    {
      title: 'Total Creators',
      value: creatorsCount || 0,
    },
  ]

  return (
    <div className='flex gap-6'>
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
        'w-full flex gap-6 flex-col p-6 rounded-[20px]'
      )}
    >
      <div className='flex justify-between w-full items-start'>
        <div className='flex flex-col gap-2 text-white'>
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
