import { EraStakesBySpaceIdsRecord } from 'src/rtk/features/creatorStaking/eraStake/eraStakeSlice'
import { BackerInfoRecord } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoSlice'
import BN from 'bignumber.js'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useBackerInfoBySpaces } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { useEraStakesByIds } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useMemo } from 'react'

const sortValues = <T extends BackerInfoRecord | EraStakesBySpaceIdsRecord>(
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
  const backersInfo = useBackerInfoBySpaces(spaceIds, myAddress)
  const eraStakes = useEraStakesByIds(spaceIds, era)

  const sortedSpaceIds = useMemo(() => {
    if (!backersInfo || !eraStakes) return spaceIds

    if (sortBy === 'total-stake') {
      return sortValues(eraStakes, 'total')
    } else if (sortBy === 'backers') {
      return sortValues(eraStakes, 'backersCount')
    } else {
      return sortValues(backersInfo, 'totalStaked')
    }
  }, [ sortBy, backersInfo, eraStakes, myAddress ])

  return sortedSpaceIds
}