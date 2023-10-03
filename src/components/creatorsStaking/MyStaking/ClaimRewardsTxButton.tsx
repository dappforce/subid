import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchStakerRewards } from 'src/rtk/features/creatorStaking/stakerRewards/stakerRewardsHooks'
import { ApiPromise } from '@polkadot/api'
import Button from '../tailwind-components/Button'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { showParsedErrorMessage } from 'src/components/utils'
import BN from 'bignumber.js'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'

type ClaimRewardsTxButtonProps = {
  rewardsSpaceIds: string[]
  totalRewards: string
  availableClaimsBySpaceId?: Record<string, string>
  restake: boolean
}

const ClaimRewardsTxButton = ({
  rewardsSpaceIds,
  totalRewards,
  availableClaimsBySpaceId,
  restake,
}: ClaimRewardsTxButtonProps) => {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()

  const onSuccess = () => {
    fetchStakerRewards(dispatch, myAddress || '', rewardsSpaceIds)
  }

  const buildParams = async (api: ApiPromise) => {
    if (!myAddress || !availableClaimsBySpaceId) return []

    const blockWeight = api.consts.system.blockWeights.toJSON() as any

    if (blockWeight) {
      const avaliableWeight = blockWeight.perClass.normal.maxExtrinsic.refTime

      const maxAvaliableWeight = avaliableWeight
        ? new BN(avaliableWeight).multipliedBy(0.5)
        : BIGNUMBER_ZERO

      const claimTx = api.tx.creatorStaking.claimBackerReward(
        rewardsSpaceIds[0],
        restake
      )

      const claimPaymentInfo = await claimTx.paymentInfo(myAddress)

      const { weight } = claimPaymentInfo.toJSON() as any
      const extrinsicWeight = weight.refTime

      const maxClaimCount =
        extrinsicWeight && maxAvaliableWeight
          ? new BN(maxAvaliableWeight).dividedBy(extrinsicWeight)
          : BIGNUMBER_ZERO

      const claimChunks = maxClaimCount
        .dividedBy(rewardsSpaceIds.length)
        .integerValue(BN.ROUND_DOWN)

      const txs = rewardsSpaceIds.map((spaceId) => {
        const availablClaimCount = new BN(
          availableClaimsBySpaceId[spaceId] || 0
        )

        const claimCount = availablClaimCount.gt(claimChunks)
          ? claimChunks
          : availablClaimCount

        return [ ...Array(claimCount.toNumber()).keys() ].map(() =>
          api.tx.creatorStaking.claimBackerReward(spaceId, restake)
        )
      })

      return [ txs.flat() ]
    }

    return []
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

export default ClaimRewardsTxButton
