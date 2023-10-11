import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { selectStakerRewards, stakerRewardsActions } from './stakerRewardsSlice'
import { isEmptyArray } from '@subsocial/utils'

export const fetchStakerRewards = (dispatch: any, account: string, spaceIds: string[]) => {
  dispatch(
    stakerRewardsActions.fetchStakerRewards({
      account,
      spaceIds,
      reload: true,
    })
  )
}

export const useFetchStakerRewards = (account?: string, spaceIds?: string[]) => {
  const dispatch = useAppDispatch()
  const stakerRewards = useStakerRewards(account)

  const { loading } = stakerRewards || {}
  
  useEffect(() => {
    if(!account || !spaceIds || isEmptyArray(spaceIds) || loading) return
    
    dispatch(
      stakerRewardsActions.fetchStakerRewards({
        account,
        spaceIds,
        reload: false,
      })
    )
  }, [ account, spaceIds?.length, loading ])

  
}

export const useStakerRewards = (account?: string) => {
  return useAppSelector((state) => selectStakerRewards(state, account || ''))
}

