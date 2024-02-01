import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import CardWrapper from '../utils/CardWrapper'
import { convertToBalanceWithDecimal } from '@subsocial/utils'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { toShortMoney } from 'src/components/common/balances'

type StatsCardProps = {
  title: string
  value: React.ReactNode
  desc?: React.ReactNode
  infoTitle?: React.ReactNode
}

export const DashboardCard = ({ title, value, desc, infoTitle }: StatsCardProps) => {
  return (
    <CardWrapper className='bg-white/50 min-h-[116px] backdrop-blur-[24.5px] w-full'>
      <div className='text-text-dark/80 flex items-center gap-2'>
        {title}
        {infoTitle && <Tooltip title={infoTitle}><QuestionCircleOutlined /></Tooltip>}
      </div>
      <div>
        <div className='text-text-dark md:text-2xl text-[19px]  font-semibold'>{value}</div>
        {desc && <div className='text-text-dark/80 text-sm'>{desc}</div>}
      </div>
    </CardWrapper>
  )
}

type SubsocialBalanceProps = {
  value: number | string
  loading?: boolean
}

export const TotalStakedBalance = ({ value, loading }: SubsocialBalanceProps) => {
  const chainsInfo = useChainInfo()

  const { tokenDecimals, tokenSymbols } = chainsInfo?.subsocial || {}

  const decimal = tokenDecimals?.[0]
  const symbol = tokenSymbols?.[0]

  if (!decimal || !symbol) return null

  const balanceWithDecimal = convertToBalanceWithDecimal(value, decimal)

  return (
    <ValueOrSkeleton
      value={<>{toShortMoney({ num: balanceWithDecimal.toNumber(), customFraction: 2 })} {symbol}</>}
      skeletonClassName='h-[20px] mb-3'
      loading={loading}
    />
  )
}