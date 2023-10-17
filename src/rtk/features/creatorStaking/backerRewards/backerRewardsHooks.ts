import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { selectBackerRewards, backerRewardsActions } from './backerRewardsSlice'
import { isEmptyArray } from '@subsocial/utils'

export const fetchBackerRewards = (dispatch: any, account: string, spaceIds: string[]) => {
  dispatch(
    backerRewardsActions.fetchBackerRewards({
      account,
      spaceIds,
      reload: true,
    })
  )
}

export const useFetchBackerRewards = (account?: string, spaceIds?: string[]) => {
  const dispatch = useAppDispatch()
  const backerRewards = useBackerRewards(account)

  const { loading } = backerRewards || {}
  
  useEffect(() => {
    if(!account || !spaceIds || isEmptyArray(spaceIds) || loading) return
    
    dispatch(
      backerRewardsActions.fetchBackerRewards({
        account,
        spaceIds,
        reload: false,
      })
    )
  }, [ account, spaceIds?.length, loading ])

  
}

export const useBackerRewards = (account?: string) => {
  return useAppSelector((state) => selectBackerRewards(state, account || ''))
}

