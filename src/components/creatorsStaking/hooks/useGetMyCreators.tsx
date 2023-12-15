import { isEmptyObj } from '@subsocial/utils'
import { useMemo } from 'react'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useBackerInfoBySpaces } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import BN from 'bignumber.js'

export const useGetMyCreatorsIds = (spaceIds?: string[]) => {
  const myAddress = useMyAddress()

  const backerInfo = useBackerInfoBySpaces(spaceIds, myAddress)

  return useMemo(() => {
    if (!backerInfo || isEmptyObj(backerInfo) || !spaceIds) return []

    const backerInfoEntries = Object.entries(backerInfo)

    return backerInfoEntries
      .filter(([ _, info ]) => !new BN(info.totalStaked).isZero())
      .map(([ key ]) => key)
  }, [ Object.keys(backerInfo || {}).join(','), spaceIds?.length ])
}
