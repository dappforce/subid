import { EraStakesBySpaceIdsRecord } from 'src/rtk/features/creatorStaking/eraStake/eraStakeSlice'
import { StakerInfoRecord } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoSlice'
import BN from 'bignumber.js'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useStakerInfoBySpaces } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { useEraStakesByIds } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useMemo } from 'react'

const sortValues = <T extends StakerInfoRecord | EraStakesBySpaceIdsRecord>(
  data: T,
  field: keyof T[string]
) => {
  const entries = Object.entries(data)

  return entries
    .sort(([ _, a ], [ __, b ]) => new BN(b[field]).minus(a[field]).toNumber())
    .map(([ key ]) => key)
}

export const useSortBy = (sortBy: string, spaceIds?: string[], era?: string) => {
  const myAddress = useMyAddress()
  const stakersInfo = useStakerInfoBySpaces(spaceIds, myAddress)
  const eraStakes = useEraStakesByIds(spaceIds, era)

  const sortedSpaceIds = useMemo(() => {
    if (!stakersInfo || !eraStakes) return spaceIds

    if (sortBy === 'total-stake') {
      return sortValues(eraStakes, 'total')
    } else if (sortBy === 'stakers') {
      return sortValues(eraStakes, 'numberOfStakers')
    } else {
      return sortValues(stakersInfo, 'totalStaked')
    }
  }, [ sortBy, stakersInfo, eraStakes, myAddress ])

  return sortedSpaceIds
}