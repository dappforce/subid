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
import {
  useIsMulti,
  useMyAddress,
} from '@/components/providers/MyExtensionAccountsContext'
import { FormatBalance } from '@/components/common/balances'
import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import BN from 'bignumber.js'
import { isDef } from '@subsocial/utils'
import BannerActionButtons from './BannerActionButtons'
import { useResponsiveSize } from '@/components/responsive'
import { useBalancesByNetwork } from '@/rtk/features/balances/balancesHooks'
import { calculateBalanceForStaking } from '@/utils/balance'
import { BN_ZERO } from '@polkadot/util'

const skeletonClassName = 'h-[20px] mb-1'

const StatsCards = () => {
  const myAddress = useMyAddress()

  const generalEraInfo = useGeneralEraInfo()
  const backerLedger = useBackerLedger(myAddress)
  const { isMobile } = useResponsiveSize()
  const isMulti = useIsMulti()

  const { tokenSymbol } = useGetChainDataByNetwork('subsocial')

  const { currencyBalance: balancesByCurrency, loading: balanceLoading } =
    useBalancesByNetwork({
      address: myAddress,
      network: 'subsocial',
      currency: tokenSymbol,
    })

  const availableBalanceValue = balancesByCurrency
    ? calculateBalanceForStaking(balancesByCurrency, 'crestake')
    : BN_ZERO

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

  const availableBalance = (
    <TotalStakedBalance
      value={availableBalanceValue.toString()}
      loading={balanceLoading}
    />
  )

  const dashboardData = useMemo(() => {
    const dashboardItem = isLockedTokens
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
      : {
          title: 'Available balance',
          value: availableBalance,
          infoTitle: 'The amount of tokens you can lock',
        }

    return [
      ...[ !isMulti && myAddress ? dashboardItem : undefined ],
      {
        title: 'Total locked',
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
  }, [ loading, ledgerLoading, balanceLoading, myAddress, isMulti ])

  return (
    <div
      className={clsx(
        'grid grid-cols-2 md:gap-6 gap-4',
        isMulti || !myAddress ? 'md:grid-cols-2' : 'md:grid-cols-3'
      )}
    >
      {dashboardData.map((data, i) => (
        <DashboardCard
          key={data.title}
          className={clsx({
            ['col-[1/-1]']: i === dashboardData.length - 1 && isMobile,
          })}
          {...data}
        />
      ))}
    </div>
  )
}

const Banner = () => {
  const myAddress = useMyAddress()
  const { isMobile } = useResponsiveSize()
  const isMulti = useIsMulti()

  useFetchGeneralEraInfo()
  useFetchBackerLedger(myAddress)

  const sendEvent = useSendEvent()

  const howItWorksButton = (
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
  )

  return (
    <div className='md:!mx-4 mx-0'>
      <div
        className={clsx(
          'sm:bg-staking-bg bg-staking-bg-mobile bg-no-repeat bg-cover',
          'w-full flex gap-6 flex-col md:p-6 p-4 rounded-[20px] md:rounded-t-[20px] rounded-t-none'
        )}
      >
        <div className='flex flex-col gap-3 w-full md:items-start items-center'>
          <div className='flex md:justify-between justify-center w-full gap-6 text-text-dark'>
            <div className='text-4xl md:text-left text-center UnboundedFont w-fit'>
              Content Staking
            </div>
            {!isMobile && howItWorksButton}
          </div>
          <div className='text-lg text-slate-500 text-center md:!text-start font-normal leading-[26px]'>
            Content Staking allows SUB token holders to earn more SUB by
            actively engaging with good content on the network.
          </div>
          {isMobile && <div>{howItWorksButton}</div>}
        </div>
        <StatsCards />
        {!isMulti && <BannerActionButtons />}
      </div>
    </div>
  )
}

export default Banner
