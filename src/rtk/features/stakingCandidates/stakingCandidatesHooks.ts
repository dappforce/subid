import { useAppSelector, useAppDispatch } from '../../app/store'
import {
  selectStakingCandidatesInfo,
  stakingCandidatesInfoActions,
} from './candidatesInfo/stakingCandidatesInfoSlice'
import { selectCandidatesList } from './stakingCandidatesList/stakingCandidatesListSlice'
import { useEffect } from 'react'
import { StakingCandidateInfoRecord } from './utils'
import { scheduledRequestsActions, selectManyScheduledRequests } from './scheduledRequests/scheduledRequestsSlice'
import { ScheduledRequestsByDelegatorEntityRecord } from './scheduledRequests/types'
import { selectselectedCandidates } from './selectedCandidates/selectedCandidatesSlice'

export const useStakingCandidatesInfoByNetwork = (
  network: string,
  accounts?: string[]
) => {
  return useAppSelector<StakingCandidateInfoRecord | undefined>((state) =>
    selectStakingCandidatesInfo(state, network, accounts)
  ) || {}
}

export const useSelectedCandidatesByNetwork = (
  network: string,
): string[] | undefined => {
  return useAppSelector<string[] | undefined>((state) =>
    selectselectedCandidates(state, network)
  )
}

export const useManyScheduledRequestsByNetwork = (
  network: string,
  accounts?: string[]
) => {
  return useAppSelector<ScheduledRequestsByDelegatorEntityRecord | undefined>((state) =>
    selectManyScheduledRequests(state, network, accounts)
  ) || {}
}

export const useStakingCandidatesListByNetwork = (network: string) => {
  return useAppSelector<string[] | undefined>((state) =>
    selectCandidatesList(state, network)
  )
}

export const useFetchCandidatesInfo = (network: string, accounts?: string[]) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!accounts) return

    dispatch({
      type: stakingCandidatesInfoActions.fetchCandidatesInfo.type,
      payload: { accounts: accounts, network, reload: false },
    })
  }, [ !!accounts, network ])
}

export const useFetchSceduledRequests = (network: string, accounts?: string[]) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!accounts) return

    dispatch({
      type: scheduledRequestsActions.fetchScheduledRequests.type,
      payload: { accounts: accounts, network, reload: false },
    })
  }, [ !!accounts, network ])
}