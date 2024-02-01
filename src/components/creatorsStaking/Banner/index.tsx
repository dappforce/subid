import clsx from 'clsx'
import Button from '../tailwind-components/Button'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import {
  useFetchGeneralEraInfo,
  useGeneralEraInfo,
} from '../../../rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import { DashboardCard, TotalStakedBalance } from './utils'
import { useMemo } from 'react'
import { useSendEvent } from '@/components/providers/AnalyticContext'
import {
  useBackerLedger,
  useFetchBackerLedger,
} from '@/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { FormatBalance } from '@/components/common/balances'
import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import BN from 'bignumber.js'
import { isDef } from '@subsocial/utils'
import BannerActionButtons from './BannerActionButtons'

const skeletonClassName = 'h-[20px] mb-1'

const StatsCards = () => {
  const myAddress = useMyAddress()

  const generalEraInfo = useGeneralEraInfo()
  const backerLedger = useBackerLedger(myAddress)

  const { decimal, tokenSymbol: symbol } = useGetChainDataByNetwork('subsocial')

  const { info, loading } = generalEraInfo ?? {}
  const { ledger, loading: ledgerLoading } = backerLedger || {}

  const stakedBalance = info?.staked ?? 0
  const { locked } = ledger || {}

  const isLockedTokens = !new BN(locked || '0').isZero()

  const myLock = (
    <FormatBalance
      value={locked || '0'}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
    />
  )

  const dashboardData = useMemo(() => {
    const myLockedDashboardItem = isLockedTokens
      ? {
          title: 'My lock',
          value: (
            <ValueOrSkeleton
              value={myLock}
              loading={ledgerLoading}
              skeletonClassName='h-[24px]'
            />
          ),
          infoTitle: 'How many tokens you have locked',
        }
      : undefined

    return [
      myLockedDashboardItem,
      {
        title: 'Total tokens locked',
        value: <TotalStakedBalance value={stakedBalance} loading={loading} />,
        infoTitle: 'The total amount of tokens locked on the Subsocial network',
      },
      {
        title: 'Total participants',
        value: (
          <ValueOrSkeleton
            value={info?.backerCount}
            skeletonClassName={skeletonClassName}
          />
        ),
        infoTitle: 'The total number of unique accounts currently locking SUB',
      },
    ].filter(isDef)
  }, [ stakedBalance, info?.backerCount, myAddress ])

  return (
    <div
      className={clsx(
        'grid grid-cols-2 md:gap-6 gap-4',
        !isLockedTokens ? 'md:grid-cols-2' : 'md:grid-cols-3'
      )}
    >
      {dashboardData.map((data) => (
        <DashboardCard key={data.title} {...data} />
      ))}
    </div>
  )
}

const Banner = () => {
  const myAddress = useMyAddress()

  useFetchGeneralEraInfo()
  useFetchBackerLedger(myAddress)

  const sendEvent = useSendEvent()

  return (
    <div className='md:!mx-4 mx-0'>
      <div
        className={clsx(
          'sm:bg-staking-bg bg-staking-bg-mobile bg-no-repeat bg-cover',
          'w-full flex gap-6 flex-col md:p-6 p-4 rounded-[20px] md:rounded-t-[20px] rounded-t-none'
        )}
      >
        <div className='flex flex-col gap-3 w-full'>
          <div className='flex justify-between gap-6 text-text-dark items-center'>
            <div className='text-4xl md:text-left text-center UnboundedFont'>
              Content Staking
            </div>
            <Button
              variant='white'
              size='sm'
              target='_blank'
              href='https://docs.subsocial.network/docs/basics/creator-staking/'
              onClick={() => sendEvent('cs_how_it_works_clicked')}
            >
              <span className='flex gap-2 items-center py-1'>
                <AiOutlineQuestionCircle size={20} /> How does it work?
              </span>
            </Button>
          </div>
          <div className='text-lg text-slate-500 font-normal leading-[26px]'>
            Content Staking allows SUB token holders to earn more SUB by
            actively engaging with good content on the network.
          </div>
        </div>
        <StatsCards />
        <BannerActionButtons />
      </div>
    </div>
  )
}

export default Banner
