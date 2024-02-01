import clsx from 'clsx'
import Button from '../tailwind-components/Button'
import { useSendEvent } from '@/components/providers/AnalyticContext'
import { useBackerLedger } from '@/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import getAmountRange from './getAmountRangeForAnalytics'
import { useResponsiveSize } from '@/components/responsive'
import BN from 'bignumber.js'

const StakingInfoBanner = () => {
  const myAddress = useMyAddress()
  const sendEvent = useSendEvent()
  const backerLedger = useBackerLedger(myAddress)
  const { decimal } = useGetChainDataByNetwork('subsocial')
  const { isMobile } = useResponsiveSize()

  const { loading, ledger } = backerLedger || {}

  const { locked } = ledger || {}

  const onButtonClick = (eventName: string) => {
    const amountRange = getAmountRange(decimal, locked)

    sendEvent(eventName, { amountRange: amountRange })
  }

  const isStaked = locked && !new BN(locked).isZero()

  if ((loading && !locked) || !isStaked) return null

  return (
    <div
      className={clsx(
        'md:bg-right bg-center bg-cover bg-no-repeat',
        'flex flex-col gap-4  relative rounded-[20px] text-white',
        'md:p-6 p-4',
        {
          ['bg-earn-sub-mobile-banner']: isStaked && isMobile,
          ['bg-earn-sub-desktop-banner']: isStaked && !isMobile,
        }
      )}
    >
      <div className='flex flex-col gap-2'>
        <div className='md:text-[32px] text-2xl md:w-full w-[17rem] UnboundedFont'>
          Be active & earn rewards
        </div>
        <div className={clsx('md:text-lg text-lg text-gray-300 w-[33rem]')}>
          Stake some SUB, then start creating posts and liking content from
          others on PolkaVerse!
        </div>
      </div>
      <div>
        <Button
          href='https://subsocial.network/active-staking-details'
          target='_blank'
          variant={'white'}
          size='lg'
          className={clsx('md:w-auto w-full border-white !text-[#A91C83]')}
          disabled={loading}
          onClick={() => onButtonClick('cs_active_cs_banner_lear_more_clicked')}
        >
          Go to Polkaverse
        </Button>
      </div>
    </div>
  )
}

export default StakingInfoBanner
