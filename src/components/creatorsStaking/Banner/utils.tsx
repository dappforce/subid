import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import CardWrapper from '../utils/CardWrapper'
import { convertToBalanceWithDecimal, toShortMoney } from '@subsocial/utils'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

type StatsCardProps = {
  title: string
  value: React.ReactNode
  desc?: React.ReactNode
  infoTitle?: React.ReactNode
}

export const DashboardCard = ({ title, value, desc, infoTitle }: StatsCardProps) => {
  return (
    <CardWrapper className='bg-background-stats-card/20 min-h-[116px] backdrop-blur-[24.5px]'>
      <div className='text-white/80 flex items-center gap-2'>
        {title}
        {infoTitle && <Tooltip title={infoTitle}><QuestionCircleOutlined /></Tooltip>}
      </div>
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

export const TotalStakedBalance = ({ value }: SubsocialBalanceProps) => {
  const chainsInfo = useChainInfo()

  const { tokenDecimals, tokenSymbols } = chainsInfo?.subsocial || {}

  const decimal = tokenDecimals?.[0]
  const symbol = tokenSymbols?.[0]

  if (!decimal || !symbol) return null

  const balanceWithDecimal = convertToBalanceWithDecimal(value, decimal)

  return (
    <ValueOrSkeleton
      value={<>{toShortMoney({ num: balanceWithDecimal.toNumber() })} {symbol}</>}
      skeletonClassName='h-[20px] mb-3'
      loading={value === undefined}
    />
  )
}