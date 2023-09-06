import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchStakerRewards } from 'src/rtk/features/creatorStaking/stakerRewards/stakerRewardsHooks'
import { ApiPromise } from '@polkadot/api'
import Button from '../tailwind-components/Button'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { showParsedErrorMessage } from 'src/components/utils'
import BN from 'bignumber.js'

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

export default ClaimRewardsTxButton