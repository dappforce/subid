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
import BN from 'bignumber.js'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { showParsedErrorMessage } from 'src/components/utils'
import { ApiPromise } from '@polkadot/api'
import {
  fetchStakerRewards,
  useFetchStakerRewards,
  useStakerRewards,
} from '../../../rtk/features/creatorStaking/stakerRewards/stakerRewardsHooks'
import { useAppDispatch } from 'src/rtk/app/store'
import ValueOrSkeleton from '../utils/ValueOrSkeleton'

type RewardCardProps = {
  title: string
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

type ClaimRewardsTxButtonProps = {
  rewardsSpaceIds: string[]
  totalRewards: string
  restake: boolean
}

const ClaimRewardsTxButton = ({
  rewardsSpaceIds,
  totalRewards,
  restake,
}: ClaimRewardsTxButtonProps) => {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()

  const onSuccess = () => {
    fetchStakerRewards(dispatch, myAddress || '', rewardsSpaceIds)
  }

  const buildParams = (api: ApiPromise) => {
    const txs = rewardsSpaceIds.map((spaceId) =>
      api.tx.creatorStaking.claimStakerReward(spaceId, restake)
    )

    return [ txs ]
  }

  const Component: React.FunctionComponent<{ onClick?: () => void }> = (
    compProps
  ) => (
    <Button {...compProps} variant={'primary'} size={'sm'}>
      Claim
    </Button>
  )

  const disableButton = !myAddress || new BN(totalRewards).isZero()

  return (
    <LazyTxButton
      network='subsocial'
      accountId={myAddress}
      tx={'utility.batch'}
      disabled={disableButton}
      component={Component}
      params={buildParams}
      onFailed={showParsedErrorMessage}
      onSuccess={onSuccess}
    />
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
    />
  )

  const myRewards = (
    <FormatBalance
      value={rewards?.totalRewards.toString() || '0'}
      decimals={decimal}
      currency={symbol}
      isGrayDecimal={false}
    />
  )

  const cardsOpt = [
    {
      title: 'My Stake',
      value: (
        <ValueOrSkeleton
          value={myStake}
          loading={ledgerLoading}
          skeletonClassName='w-32 h-[24px]'
        />
      ),
    },
    {
      title: 'Estimated Rewards',
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
