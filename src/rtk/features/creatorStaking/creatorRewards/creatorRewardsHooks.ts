import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import {
  creatorRewardsActions,
  selectCreatorRewards,
} from './creatorRewardsSlice'
import { isEmptyArray } from '@subsocial/utils'

export const fetchCreatorRewards = (dispatch: any, account: string, spaceIds: string[]) => {
  dispatch(
    creatorRewardsActions.fetchCreatorRewards({
      account,
      spaceIds,
      reload: true,
    })
  )
}

export const useFetchCreatorRewards = (account?: string, spaceIds?: string[]) => {
  const dispatch = useAppDispatch()

  const creatorRewards = useCreatorRewards(account)

  const { loading } = creatorRewards || {}

  useEffect(() => {
    if (!spaceIds || isEmptyArray(spaceIds) || !account || loading) return

    dispatch(
      creatorRewardsActions.fetchCreatorRewards({
        account,
        spaceIds,
        reload: false,
      })
    )
  }, [ spaceIds?.length, account, loading ])
}

export const useCreatorRewards = (account?: string) => {
  return useAppSelector((state) => selectCreatorRewards(state, account || ''))
}
