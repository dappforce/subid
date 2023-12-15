import { EraStakesBySpaceIdsRecord } from 'src/rtk/features/creatorStaking/eraStake/eraStakeSlice'
import { BackerInfoRecord } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoSlice'
import BN from 'bignumber.js'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useBackerInfoBySpaces } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { useEraStakesByIds } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import { useMemo, useState } from 'react'
import { shuffle } from 'lodash'
import { isEmptyArray } from '@subsocial/utils'

const sortValues = <T extends BackerInfoRecord | EraStakesBySpaceIdsRecord>(
  data: T,
  field: keyof T[string]
) => {
  const entries = Object.entries(data)

  return entries
    .sort(([_, a], [__, b]) => new BN(b[field]).minus(a[field]).toNumber())
    .map(([key]) => key)
}

export const useSortBy = (
  sortBy: string,
  spaceIds?: string[],
  era?: string
) => {
  const myAddress = useMyAddress()
  const backersInfo = useBackerInfoBySpaces(spaceIds, myAddress)
  const eraStakes = useEraStakesByIds(spaceIds, era)
  const [shuffledSpaceIds, setShuffledSpaceIds] = useState<string[]>()

  const sortedSpaceIds = useMemo(() => {
    if (!backersInfo || !eraStakes) return spaceIds

    if (sortBy === 'total-stake') {
      return sortValues(eraStakes, 'totalStaked')
    } else if (sortBy === 'backers') {
      return sortValues(eraStakes, 'backersCount')
    } else if (sortBy === 'my-stake') {
      return sortValues(backersInfo, 'totalStaked')
    } else {
      const isNewSpaceIdsArr = !isEmptyArray(
        spaceIds?.filter((spaceId) => shuffledSpaceIds?.includes(spaceId)) || []
      )

      if (!shuffledSpaceIds?.length && isNewSpaceIdsArr) {
        setShuffledSpaceIds(shuffle(spaceIds))
      }

      return shuffledSpaceIds
    }
  }, [
    sortBy,
    JSON.stringify(backersInfo || {}),
    spaceIds,
    eraStakes,
    myAddress,
  ])

  return sortedSpaceIds
}
