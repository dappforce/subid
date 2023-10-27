import { Tooltip } from 'antd'
import CardWrapper from './CardWrapper'
import { QuestionCircleOutlined } from '@ant-design/icons'

type RewardCardProps = {
  title: React.ReactNode
  value: React.ReactNode
  desc?: string
  button?: React.ReactNode
  tooltipTitle?: React.ReactNode
}

const DashboardCard = ({
  title,
  value,
  desc,
  button,
  tooltipTitle,
}: RewardCardProps) => (
  <CardWrapper className='bg-slate-50'>
    <div className='text-text-muted font-normal flex align items-center gap-2'>
      {title}
      {tooltipTitle && (
        <Tooltip title={tooltipTitle}>
          <QuestionCircleOutlined />
        </Tooltip>
      )}
    </div>
    <div className='flex justify-between items-center gap-2'>
      <div className='w-full'>
        <div className='text-2xl font-semibold'>{value}</div>
        {desc && (
          <div className='font-normal text-text-muted text-sm'>{desc}</div>
        )}
      </div>
      {button}
    </div>
  </CardWrapper>
)

export default DashboardCard
