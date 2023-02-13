import { useEffect } from 'react'
import { useAppDispatch, useAppSelector, AppDispatch } from '../../../app/store'
import { toGenericAccountId } from '../../../app/util'
import { stakingNominatorInfoActions, StakingNominatorInfoEntity, selectStakingNominatorInfo } from './nominatorInfoSlice'

export const useFetchNominatorsInfo = (network: string, account?: string) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if(!account) return

    dispatch({
      type: stakingNominatorInfoActions.fetchNominatorInfo.type,
      payload: { account: toGenericAccountId(account), network, reload: false },
    })
  }, [ account, network ])
}

export const useNominatorInfo = (network: string, account?: string) => {
  return useAppSelector<StakingNominatorInfoEntity>((state: any) => 
    selectStakingNominatorInfo(state, account ? toGenericAccountId(account) : '', network)) || {}
}

export const FETCH_REWARD_DESTINATION = 'fetchRewardDestination'

export const fetchRewardDestination = (dispatch: AppDispatch, network: string, account: string) => {
  const genericAccountId = toGenericAccountId(account)

  if(!genericAccountId) return
  dispatch({ type: FETCH_REWARD_DESTINATION, payload: { network, account: genericAccountId, reload: true } })
} 

export const FETCH_CONTROLLER = 'fetchController'

export const fetchController = (dispatch: AppDispatch, network: string, account: string) => {
  const genericAccountId = toGenericAccountId(account)

  if(!genericAccountId) return
  dispatch({ type: FETCH_CONTROLLER, payload: { network, account: genericAccountId, reload: true } })
} 

export const FETCH_STAKING_LEDGER = 'fetchStakingLedger'

export const fetchStakingLedger = (dispatch: AppDispatch, network: string, account: string) => {
  const genericAccountId = toGenericAccountId(account)

  if(!genericAccountId) return
  dispatch({ type: FETCH_STAKING_LEDGER, payload: { network, account: genericAccountId, reload: true } })
} 

export const FETCH_NOMINATORS = 'fetchNominators'

export const fetchNominators = (dispatch: AppDispatch, network: string, account: string) => {
  const genericAccountId = toGenericAccountId(account)

  if(!genericAccountId) return
  dispatch({ type: FETCH_NOMINATORS, payload: { network, account: genericAccountId, reload: true } })
} 

export const FETCH_STAKING_LADGER_AND_NOMINATORS = 'fetchStakingLadgerAndNominators'

export const fetchStakingLadgerAndNominators = (dispatch: AppDispatch, network: string, account: string) => {
  const genericAccountId = toGenericAccountId(account)

  if(!genericAccountId) return
  dispatch({ type: FETCH_STAKING_LADGER_AND_NOMINATORS, payload: { network, account: genericAccountId, reload: true } })
} 
