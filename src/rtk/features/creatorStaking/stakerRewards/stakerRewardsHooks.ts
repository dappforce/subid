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

  
  useEffect(() => {
    if(!account || !spaceIds || isEmptyArray(spaceIds)) return
    
    dispatch(
      stakerRewardsActions.fetchStakerRewards({
        account,
        spaceIds,
        reload: false,
      })
    )
  }, [ account, spaceIds?.length ])

  
}

export const useStakerRewards = (account?: string) => {
  return useAppSelector((state) => selectStakerRewards(state, account || ''))
}

