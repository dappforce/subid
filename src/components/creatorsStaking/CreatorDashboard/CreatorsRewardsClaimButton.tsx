import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import Button from '../tailwind-components/Button'
import BN from 'bignumber.js'
import { showParsedErrorMessage } from 'src/components/utils'
import {
  fetchCreatorRewards,
  useCreatorRewards,
} from 'src/rtk/features/creatorStaking/creatorRewards/creatorRewardsHooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { ApiPromise } from '@polkadot/api'
import calculateMaxTxCountInBatch from '../utils/calculateMaxTxCount'
import { fetchBalanceByNetwork } from 'src/rtk/features/balances/balancesHooks'

type CreatorRewardsClaimButtonProps = {}

const CreatorRewardsClaimButton = ({}: CreatorRewardsClaimButtonProps) => {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const creatorRewards = useCreatorRewards(myAddress)

  const { data } = creatorRewards || {}

  const { rewards, availableClaims } = data || {}

  const onSuccess = () => {
    if (availableClaims) {
      fetchCreatorRewards(
        dispatch,
        myAddress || '',
        Object.keys(availableClaims)
      )

      fetchBalanceByNetwork(dispatch, [ myAddress || '' ], 'subsocial')
    }
  }

  const buildParams = async (api: ApiPromise) => {
    if (!myAddress || !availableClaims) return []

    const rewardsSpaceIds = Object.keys(availableClaims)
    const era = availableClaims[rewardsSpaceIds[0]][0]

    const calculatedMaxClaimCount = await calculateMaxTxCountInBatch(
      api,
      api.tx.creatorStaking.claimCreatorReward(rewardsSpaceIds[0], era),
      myAddress
    )

    if (!calculatedMaxClaimCount) return []

    const txs: any[] = []
    let maxClaimCount = calculatedMaxClaimCount

    Object.entries(availableClaims).forEach(([ spaceId, availableClaims ]) => {
      if (new BN(availableClaims.length).lt(maxClaimCount)) {
        availableClaims.forEach((era) => {
          const claimTx = api.tx.creatorStaking.claimCreatorReward(spaceId, era)

          txs.push(claimTx)
        })
        maxClaimCount = maxClaimCount.minus(availableClaims.length)
      } else {
        const claimsCount = availableClaims.slice(0, maxClaimCount.toNumber())

        claimsCount.forEach((era) => {
          const claimTx = api.tx.creatorStaking.claimCreatorReward(spaceId, era)

          txs.push(claimTx)
        })
      }
    })

    return [ txs ]
  }

  const Component: React.FunctionComponent<{ onClick?: () => void }> = (
    compProps
  ) => (
    <Button {...compProps} variant={'primary'} size={'sm'}>
      Claim
    </Button>
  )

  const disableButton = !myAddress || (!!rewards && new BN(rewards).isZero())

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

export default CreatorRewardsClaimButton
