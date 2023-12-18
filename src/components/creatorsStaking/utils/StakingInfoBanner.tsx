import clsx from 'clsx'
import Button from '../tailwind-components/Button'
import { useSendEvent } from '@/components/providers/AnalyticContext'
import { useBackerLedger } from '@/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useGetDecimalsAndSymbolByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import getAmountRange from './getAmountRangeForAnalytics'
import { useResponsiveSize } from '@/components/responsive'
import BN from 'bignumber.js'
import { getCurrentWallet } from '@/components/utils'

const StakingInfoBanner = () => {
  const myAddress = useMyAddress()
  const sendEvent = useSendEvent()
  const backerLedger = useBackerLedger(myAddress)
  const { decimal } = useGetDecimalsAndSymbolByNetwork('subsocial')
  const { isMobile } = useResponsiveSize()
  const wallet = getCurrentWallet()

  const { loading, ledger } = backerLedger || {}

  const { locked } = ledger || {}

  const onButtonClick = (eventName: string) => {
    const amountRange = getAmountRange(decimal, locked)

    sendEvent(eventName, { amountRange: amountRange })
  }

  const isStaked = locked && !new BN(locked).isZero()

  if ((loading && !locked) || !isStaked) return null

  const walletForDiscussUrl = wallet ? `?wallet=${wallet}` : ''

  return (
    <div
      className={clsx(
        'md:bg-right bg-center bg-cover bg-no-repeat',
        'flex flex-col gap-4  relative rounded-[20px] text-white',
        'md:p-6 p-4',
        {
          // ['bg-support-creators-mobile-banner']: !isStaked && isMobile,
          // ['bg-support-creators-desktop-banner']: !isStaked && !isMobile,
          ['bg-earn-sub-mobile-banner']: isStaked && isMobile,
          ['bg-earn-sub-desktop-banner']: isStaked && !isMobile,
        }
      )}
    >
      <div className='flex flex-col gap-2'>
        <div className='md:text-4xl text-2xl md:w-full w-[17rem] UnboundedFont'>
          Earn extra SUB tokens
        </div>
        <div
          className={clsx('md:text-xl text-lg text-white/80', {
            ['w-[14rem]']: isStaked && isMobile,
          })}
        >
          Get rewarded based on your social activity
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Button
          href='https://subsocial.network/active-staking-details'
          target='_blank'
          variant={'white'}
          className={clsx(
            'md:w-auto w-full border-white !text-[#A91C83]'
          )}
          disabled={loading}
          onClick={() => onButtonClick('cs_active_cs_banner_lear_more_clicked')}
        >
          Learn more
        </Button>
        <Button
          href={`https://grill.chat/creators/stakers-20132${walletForDiscussUrl}`}
          target='_blank'
          className='text-white md:w-auto w-full'
          variant={'whiteOutline'}
          disabled={loading}
          onClick={() => onButtonClick('cs_active_cs_banner_discuss_clicked')}
        >
          {isMobile ? 'Discuss' : 'Discuss the feature'}
        </Button>
      </div>
    </div>
  )
}

export default StakingInfoBanner
