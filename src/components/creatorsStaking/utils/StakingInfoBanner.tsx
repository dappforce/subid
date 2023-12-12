import clsx from 'clsx'
import Button from '../tailwind-components/Button'
import { useSendEvent } from '@/components/providers/AnalyticContext'
import { useBackerLedger } from '@/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useGetDecimalsAndSymbolByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import getAmountRange from './getAmountRangeForAnalytics'

const StakingInfoBanner = () => {
  const myAddress = useMyAddress()
  const sendEvent = useSendEvent()
  const backerLedger = useBackerLedger(myAddress)
  const { decimal } = useGetDecimalsAndSymbolByNetwork('subsocial')

  const { loading, ledger } = backerLedger || {}

  const { locked } = ledger || {}

  const onButtonClick = (eventName: string) => {
    const amountRange = getAmountRange(decimal, locked)

    sendEvent(eventName, { amountRange: amountRange })
  }

  return (
    <div
      className={clsx(
        'bg-staking-info-banner-mobile md:bg-staking-info-banner bg-right bg-cover bg-no-repeat',
        '!mx-4 flex flex-col gap-4  relative rounded-[20px] text-white',
        'md:p-6 p-4'
      )}
    >
      <div className='flex flex-col gap-2'>
        <div className='md:text-4xl text-2xl md:w-full w-[13rem] UnboundedFont'>Receive extra SUB tokens</div>
        <div className='md:text-xl text-lg'>
          Get rewarded based on your social activity
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Button
          href='https://grill.chat/creators/stakers-20132'
          target='_blank'
          variant={'primary'}
          className='text-white md:w-auto w-full'
          disabled={loading}
          onClick={() => onButtonClick('cs_active_cs_banner_lear_more_clicked')}
        >
          Learn more
        </Button>
        <Button
          href='https://subsocial.network/active-staking-details'
          target='_blank'
          className='text-white md:w-auto w-full'
          variant={'whiteOutline'}
          disabled={loading}
          onClick={() => onButtonClick('cs_active_cs_banner_discuss_clicked')}
        >
          Dicsuss
        </Button>
      </div>
    </div>
  )
}

export default StakingInfoBanner
