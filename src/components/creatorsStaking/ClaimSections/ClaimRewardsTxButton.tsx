import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useAppDispatch } from 'src/rtk/app/store'
import {
  fetchBackerRewards,
  useBackerRewards,
} from 'src/rtk/features/creatorStaking/backerRewards/backerRewardsHooks'
import { ApiPromise } from '@polkadot/api'
import Button from '../tailwind-components/Button'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { showParsedErrorMessage } from 'src/components/utils'
import BN from 'bignumber.js'
import calculateMaxTxCountInBatch from '../utils/calculateMaxTxCount'
import { fetchBackerInfo } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import {
  fetchGeneralEraInfo,
  useGeneralEraInfo,
} from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import { fetchEraStakes } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { fetchBackerLedger } from 'src/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { useSendEvent } from '@/components/providers/AnalyticContext'
import { useResponsiveSize } from '@/components/responsive'
import { fetchCreatorRewards } from '@/rtk/features/creatorStaking/creatorRewards/creatorRewardsHooks'
import { isEmptyArray } from '@subsocial/utils'

type ClaimRewardsTxButtonProps = {
  backerClaimsCount?: Record<string, string>
  creatorClaimsCount?: Record<string, string[]>
  rewardsSpaceIds: string[]
  totalRewards: string
  restake: boolean
  label: React.ReactNode
}

const ClaimRewardsTxButton = ({
  rewardsSpaceIds,
  backerClaimsCount = {},
  creatorClaimsCount = {},
  totalRewards,
  restake,
  label,
}: ClaimRewardsTxButtonProps) => {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const eraInfo = useGeneralEraInfo()
  const backerRewards = useBackerRewards(myAddress)
  const sendEvent = useSendEvent()
  const { isMobile } = useResponsiveSize()

  const { loading } = backerRewards || {}

  const onSuccess = () => {
    fetchGeneralEraInfo(dispatch)

    if (myAddress) {
      fetchCreatorRewards(
        dispatch,
        myAddress || '',
        Object.keys(creatorClaimsCount)
      )
      fetchBackerRewards(dispatch, myAddress, rewardsSpaceIds)
      fetchBackerLedger(dispatch, myAddress)
    }

    if (restake) {
      fetchBackerInfo(dispatch, rewardsSpaceIds, myAddress || '')
      fetchEraStakes(
        dispatch,
        rewardsSpaceIds,
        eraInfo?.info?.currentEra || '0'
      )
    }
  }

  const buildCreatorParams = async (api: ApiPromise) => {
    if (!myAddress || !creatorClaimsCount) return []

    const rewardsSpaceIds = Object.keys(creatorClaimsCount)
    const era = creatorClaimsCount[rewardsSpaceIds[0]][0]

    const calculatedMaxClaimCount = await calculateMaxTxCountInBatch(
      api,
      api.tx.creatorStaking.claimCreatorReward(rewardsSpaceIds[0], era),
      myAddress
    )

    if (!calculatedMaxClaimCount) return []

    const txs: any[] = []
    let maxClaimCount = calculatedMaxClaimCount

    Object.entries(creatorClaimsCount).forEach(([ spaceId, availableClaims ]) => {
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

  const buildBackersParams = async (api: ApiPromise) => {
    if (!myAddress || !backerClaimsCount) return []

    const calculatedMaxClaimCount = await calculateMaxTxCountInBatch(
      api,
      api.tx.creatorStaking.claimBackerReward(rewardsSpaceIds[0], restake),
      myAddress
    )

    if (!calculatedMaxClaimCount) return []

    let maxClaimCount = calculatedMaxClaimCount

    let claimsToDo: Record<string, string> = {}

    Object.entries(backerClaimsCount).forEach(
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
    <Button {...compProps} variant={'primary'} size={isMobile ? 'md' : 'lg'}>
      {label}
    </Button>
  )

  const disableButton = !myAddress || new BN(totalRewards).isZero() || loading

  const isCreatorRewards = !isEmptyArray(Object.keys(creatorClaimsCount))

  return (
    <LazyTxButton
      network='subsocial'
      accountId={myAddress}
      tx={'utility.batch'}
      disabled={disableButton}
      onClick={() => sendEvent('cs_claim', { restake })}
      component={Component}
      params={isCreatorRewards ? buildCreatorParams : buildBackersParams}
      onFailed={showParsedErrorMessage}
      onSuccess={onSuccess}
    />
  )
}

export default ClaimRewardsTxButton
