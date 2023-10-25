import CardWrapper from './CardWrapper'

type RewardCardProps = {
  title: React.ReactNode
  value: React.ReactNode
  desc?: string
  button?: React.ReactNode
}

const DashboardCard = ({ title, value, desc, button }: RewardCardProps) => {
  return (
    <CardWrapper className='bg-slate-50'>
      <div className='text-text-muted font-normal'>{title}</div>
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
}

export default DashboardCard 