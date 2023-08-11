import clsx from 'clsx'
import Button from '../tailwind-components/Button'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import CardWrapper from '../utils/CardWrapper'

const StatsCard = () => {
  return (
    <CardWrapper className='bg-background-stats-card/20 backdrop-blur-[24.5px]'>
      <div className='text-white/80'>Total Staked</div>
      <div>
        <div className='text-white text-2xl font-semibold'>1.2B SUB</div>
        <div className='text-white/80 text-sm'>$194.7M</div>
      </div>
    </CardWrapper>
  )
}

const StatsCards = () => {
  return (
    <div className='flex gap-6'>
      {[ 1, 2, 3, 4 ].map((i) => (
        <StatsCard key={i} />
      ))}
    </div>
  )
}

const Banner = () => {
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
