import CardWrapper from '../utils/CardWrapper'
import { useState } from 'react'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { useStakerLedger } from 'src/rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'
import { FormatBalance } from 'src/components/common/balances'
import Button from '../tailwind-components/Button'
import store from 'store'
import { useCreatorsList } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { useGetMyCreatorsIds } from '../hooks/useGetMyCreators'
import {
  useFetchStakerRewards,
  useStakerRewards,
} from '../../../rtk/features/creatorStaking/stakerRewards/stakerRewardsHooks'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import ClaimRewardsTxButton from './ClaimRewardsTxButton'

type RewardCardProps = {
  title: React.ReactNode
  value: React.ReactNode
  desc?: string
  button?: React.ReactNode
}

const RewardCard = ({ title, value, desc, button }: RewardCardProps) => {
  return (
    <CardWrapper className='bg-slate-50'>
      <div className='text-text-muted font-normal'>{title}</div>
      <div className='flex justify-between items-center gap-2'>
        <div>
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

type RestakeButtonProps = {
  restake: boolean
  setRestake: (restake: boolean) => void
}

const RestakeButton = ({ restake, setRestake }: RestakeButtonProps) => {
  const onButtonClick = (restake: boolean) => {
    setRestake(!restake)
    store.set('RestakeAfterClaim', !restake)
  }

  return (
    <Button
      size={'sm'}
      variant={'primaryOutline'}
      onClick={() => onButtonClick(restake)}
    >
      {restake ? 'Turn off' : 'Turn on'}
    </Button>
  )
}

const MyRewards = () => {
  const restakeStateFromStorage = store.get('RestakeAfterClaim')
  const [ restake, setRestake ] = useState<boolean>(restakeStateFromStorage)
  const myAddress = useMyAddress()
  const chainsInfo = useChainInfo()
  const creatorsList = useCreatorsList()

  const creatorsSpaceIds = creatorsList?.map((creator) => creator.id)

  const myCreatorsIds = useGetMyCreatorsIds(creatorsSpaceIds)

  useFetchStakerRewards(myAddress, myCreatorsIds)

  const stakerLedger = useStakerLedger(myAddress)

  const stakerRewards = useStakerRewards(myAddress)

  const { rewards, loading: rewardsLoading } = stakerRewards || {}
  const { ledger, loading: ledgerLoading } = stakerLedger || {}

  const { spaceIds, totalRewards } = rewards || {}
  const { locked } = ledger || {}

  const { tokenDecimals, tokenSymbols, nativeToken } =
    chainsInfo?.subsocial || {}

  const decimal = tokenDecimals?.[0] || 0
  const symbol = tokenSymbols?.[0] || nativeToken

  const myStake = (
    <FormatBalance
      value={locked}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
      withCurrency={false}
    />
  )

  const myRewards = (
    <FormatBalance
      value={rewards?.totalRewards.toString() || '0'}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
      withCurrency={false}
    />
  )

  const cardsOpt = [
    {
      title: <>My Stake, {symbol}</>,
      value: (
        <ValueOrSkeleton
          value={myStake}
          loading={ledgerLoading}
          skeletonClassName='w-32 h-[24px]'
        />
      ),
    },
    {
      title: <>Estimated Rewards, {symbol }</>,
      value: (
        <ValueOrSkeleton
          value={myRewards}
          loading={rewardsLoading}
          skeletonClassName='w-32 h-[24px]'
        />
      ),
      button: (
        <ClaimRewardsTxButton
          rewardsSpaceIds={spaceIds || []}
          totalRewards={totalRewards || '0'}
          restake={restake}
        />
      ),
    },
    {
      title: 'Re-Stake After Claiming',
      value: <div className='font-semibold'>{restake ? 'ON' : 'OFF'}</div>,
      button: <RestakeButton restake={restake} setRestake={setRestake} />,
    },
  ]

  const stakingCards = cardsOpt.map((card, i) => (
    <RewardCard key={i} {...card} />
  ))

  return (
    <div className='flex normal:flex-row flex-col gap-4'>{stakingCards}</div>
  )
}

export default MyRewards
