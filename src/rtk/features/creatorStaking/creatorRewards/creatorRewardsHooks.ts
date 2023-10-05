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

  useEffect(() => {
    if (!spaceIds || isEmptyArray(spaceIds) || !account) return

    dispatch(
      creatorRewardsActions.fetchCreatorRewards({
        account,
        spaceIds,
        reload: false,
      })
    )
  }, [ spaceIds?.length, account ])
}

export const useCreatorRewards = (account?: string) => {
  return useAppSelector((state) => selectCreatorRewards(state, account || ''))
}
