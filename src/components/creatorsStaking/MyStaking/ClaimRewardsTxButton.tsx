import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchStakerRewards } from 'src/rtk/features/creatorStaking/stakerRewards/stakerRewardsHooks'
import { ApiPromise } from '@polkadot/api'
import Button from '../tailwind-components/Button'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { showParsedErrorMessage } from 'src/components/utils'
import BN from 'bignumber.js'
import calculateMaxTxCountInBatch from '../utils/calculateMaxTxCount'
import { fetchStakerInfo } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { fetchGeneralEraInfo, useGeneralEraInfo } from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { fetchEraStakes } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { fetchStakerLedger } from 'src/rtk/features/creatorStaking/stakerLedger/stakerLedgerHooks'

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
  const eraInfo = useGeneralEraInfo()

  const onSuccess = () => {
    fetchGeneralEraInfo(dispatch)
    
    if(myAddress) {
      fetchStakerRewards(dispatch, myAddress, rewardsSpaceIds)
      fetchStakerLedger(dispatch, myAddress)
    }

    if(restake) {
      fetchStakerInfo(dispatch, rewardsSpaceIds, myAddress || '')
      fetchEraStakes(dispatch, rewardsSpaceIds, eraInfo?.currentEra || '0')
    }
  }

  const buildParams = async (api: ApiPromise) => {
    if (!myAddress || !availableClaimsBySpaceId) return []

    const calculatedMaxClaimCount = await calculateMaxTxCountInBatch(
      api,
      api.tx.creatorStaking.claimBackerReward(rewardsSpaceIds[0], restake),
      myAddress
    )

    if (!calculatedMaxClaimCount) return []

    let maxClaimCount = calculatedMaxClaimCount

    let claimsToDo: Record<string, string> = {}

    Object.entries(availableClaimsBySpaceId).forEach(
      ([ spaceId, availableClaimCount ]) => {
        if (new BN(availableClaimCount).lt(maxClaimCount)) {
          claimsToDo[spaceId] = availableClaimCount
          maxClaimCount = maxClaimCount.minus(availableClaimCount)
        } else {
          claimsToDo[spaceId] = maxClaimCount.toString()
        }
      }
    )

    const txs = Object.entries(claimsToDo).map(([ spaceId, claimCount ]) => {
      return [ ...Array(parseInt(claimCount)).keys() ].map(() =>
        api.tx.creatorStaking.claimBackerReward(spaceId, restake)
      )
    })

    return [ txs.flat() ]
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
