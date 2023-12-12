import clsx from 'clsx'
import Button from '../tailwind-components/Button'
// import { IoMdClose } from 'react-icons/io'
// import store from 'store'
// import { useState } from 'react'

// const bannerStoreKey = 'staking-info-banner:closed'

const StakingInfoBanner = () => {
  // const stakingInfoBannerClosed = store.get(bannerStoreKey)
  // const [isBannerClosed, setIsBannerClosed] = useState(
  //   stakingInfoBannerClosed !== undefined ? stakingInfoBannerClosed : false
  // )

  // const onCloseClick = () => {
  //   setIsBannerClosed(true)
  //   store.set(bannerStoreKey, true)
  // }

  // if (isBannerClosed) return null

  return (
    <div
      className={clsx(
        'bg-staking-info-banner bg-cover bg-no-repeat rounded-[20px] text-white',
        'md:!mx-4 mx-0 flex flex-col gap-4 p-6 relative'
      )}
    >
      <div className='flex flex-col gap-2'>
        <div className='text-4xl UnboundedFont'>Receive extra SUB tokens</div>
        <div className='text-xl'>
          Get rewarded based on your social activity
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Button variant={'primary'}>Learn more</Button>
        <Button className='text-white' variant={'whiteOutline'}>
          Dicsuss
        </Button>
      </div>

      {/* <div className='absolute right-2 top-2 text-xl'>
        <Button onClick={onCloseClick} variant='transparent' size={'circle'}>
          <IoMdClose />
        </Button>
      </div> */}
    </div>
  )
}

export default StakingInfoBanner
