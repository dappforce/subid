import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { stakingRewardActions, selectStakingReward, StakingRewardEntity } from './rewardsSlice'
import { toGenericAccountId } from '../../../app/util'

export const useFetchStakingReward = (network: string, account?: string) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if(!account) return

    dispatch(stakingRewardActions.fetchStakingReward({ 
      network, 
      account: toGenericAccountId(account), 
      reload: false
    }))
  }, [ network, account ])
}

export const useStakingRewardByAccount = (network: string, account?: string) => 
  useAppSelector<StakingRewardEntity | undefined>((state: any) => 
    selectStakingReward(state, account ? toGenericAccountId(account) : '', network))

