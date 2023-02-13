import { useAppSelector, useAppDispatch } from '../../app/store'

import { useEffect } from 'react'
import { StakingDelegatorStateEntityRecord } from './delegatorState/types'
import { selectStakingDelegatorsState, stakingDelegatorStateActions, selectStakingDelegatorState, StakingDelegatorStateEntity } from './delegatorState/stakingDelegatorsStateSlice'
import { toGenericAccountIds, toGenericAccountId } from '../../app/util'

export const useStakingDelegatorsStateByNetwork = (
  network: string,
  accounts?: string[]
) => {
  return useAppSelector<StakingDelegatorStateEntityRecord | undefined>((state) =>
    selectStakingDelegatorsState(state, network, accounts ? toGenericAccountIds(accounts) : [])
  ) || {}
}

export const useStakingDelegatorStateByNetwork = (
  network: string,
  account?: string
): StakingDelegatorStateEntity | undefined => {
  return useAppSelector<StakingDelegatorStateEntity | undefined>((state) =>
    selectStakingDelegatorState(state, account ? toGenericAccountId(account) : '', network,)
  )
}

export const useFetchStakingDelegatorsState = (network: string, accounts?: string[]) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!accounts) return

    dispatch({
      type: stakingDelegatorStateActions.fetchDelegatorState.type,
      payload: { accounts: toGenericAccountIds(accounts), network, reload: false },
    })
  }, [ !!accounts, network ])
}
