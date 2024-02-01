import { useState, useMemo } from 'react'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useBackerLedger } from 'src/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { FormatBalance } from 'src/components/common/balances'
import Button from '../tailwind-components/Button'
import store from 'store'
import { useCreatorsList } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { useGetMyCreatorsIds } from '../hooks/useGetMyCreators'
import {
  useFetchBackerRewards,
  useBackerRewards,
} from '../../../rtk/features/creatorStaking/backerRewards/backerRewardsHooks'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'
import ClaimRewardsTxButton from '../ClaimSections/ClaimRewardsTxButton'
import DashboardCard from '../utils/DashboardCard'
import { useGetChainDataByNetwork } from 'src/components/utils/useGetDecimalsAndSymbolByNetwork'

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
      className='min-w-fit'
    >
      {restake ? 'Turn off' : 'Turn on'}
    </Button>
  )
}

const MyRewards = () => {
  const restakeStateFromStorage = store.get('RestakeAfterClaim')
  const [ restake, setRestake ] = useState<boolean>(restakeStateFromStorage)
  const myAddress = useMyAddress()
  const creatorsList = useCreatorsList()
  const { decimal, tokenSymbol: symbol } =
    useGetChainDataByNetwork('subsocial')

  const creatorsSpaceIds = useMemo(
    () => creatorsList?.map((creator) => creator.id),
    [ creatorsList?.length ]
  )

  const myCreatorsIds = useGetMyCreatorsIds(creatorsSpaceIds)

  useFetchBackerRewards(
    myAddress,
    myCreatorsIds.length ? myCreatorsIds : creatorsSpaceIds
  )
  const backerRewards = useBackerRewards(myAddress)

  const backerLedger = useBackerLedger(myAddress)

  const { data: rewardsData, loading: rewardsLoading } = backerRewards || {}
  const { ledger, loading: ledgerLoading } = backerLedger || {}

  const { rewards, availableClaimsBySpaceId } = rewardsData || {}

  const { totalRewards } = rewards || {}
  const { locked } = ledger || {}

  const myStake = (
    <FormatBalance
      value={locked || '0'}
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
          skeletonClassName='h-[24px]'
        />
      ),
      tooltipTitle: 'How many tokens you have staked across all creators',
    },
    {
      title: <>My Estimated Rewards, {symbol}</>,
      value: (
        <ValueOrSkeleton
          value={myRewards}
          loading={rewardsLoading}
          skeletonClassName='h-[24px]'
        />
      ),
      button: (
        <ClaimRewardsTxButton
          rewardsSpaceIds={Object.keys(availableClaimsBySpaceId || {}) || []}
          totalRewards={totalRewards || '0'}
          availableClaimsBySpaceId={availableClaimsBySpaceId}
          restake={restake}
        />
      ),
      tooltipTitle:
        'The estimated amount of SUB you have available to claim as staking rewards',
    },
    {
      title: 'Re-Stake After Claiming',
      value: <div className='font-semibold'>{restake ? 'ON' : 'OFF'}</div>,
      button: <RestakeButton restake={restake} setRestake={setRestake} />,
      tooltipTitle:
        'Turning this on will automatically stake your rewards after you claim them',
    },
  ]

  const stakingCards = cardsOpt.map((card, i) => (
    <DashboardCard key={i} {...card} />
  ))

  return (
    <div className='flex normal:flex-row flex-col gap-4'>{stakingCards}</div>
  )
}

export default MyRewards
