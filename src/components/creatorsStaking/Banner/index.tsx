import clsx from 'clsx'
const StatsCard = () => {
  return (
    <div
      className={clsx(
        'bg-background-stats-card/20 backdrop-blur-[24.5px] w-full',
        'flex flex-col gap-2 px-6 !py-4 rounded-2xl'
      )}
    >
      <div className='text-white/80'>Total Staked</div>
      <div>
        <div className='text-white text-2xl font-semibold'>1.2B SUB</div>
        <div className='text-white/80 text-sm'>$194.7M</div>
      </div>
    </div>
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
      <div className='flex flex-col gap-2 text-white'>
        <div className='text-3xl UnboundedFont'>Create2Earn</div>
        <div className='text-[20px]'>An innovative way to stake</div>
      </div>
      <StatsCards />
    </div>
  )
}

export default Banner
