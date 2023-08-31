import { isEmptyObj } from '@subsocial/utils'
import { useMemo } from 'react'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useStakerInfoBySpaces } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import BN from 'bignumber.js'

export const useGetMyCreatorsIds = (spaceIds?: string[]) => {
  const myAddress = useMyAddress()

  const stakerInfo = useStakerInfoBySpaces(spaceIds, myAddress)

  return useMemo(() => {
    if (!stakerInfo || isEmptyObj(stakerInfo) || !spaceIds) return []

    const stakerInfoEntries = Object.entries(stakerInfo)

    return stakerInfoEntries
      .filter(([_, info]) => !new BN(info.totalStaked).isZero())
      .map(([key]) => key)
  }, [isEmptyObj(stakerInfo), spaceIds?.length])
}
