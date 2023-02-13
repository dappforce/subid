import { useAppDispatch, useAppSelector } from '../../app/store'
import { stakingRoundActions, selectStakingRound } from './stakingRoundSlice'
import { Round } from './types'

export const useFetchStakingRound = (network: string) => {
  const dispatch = useAppDispatch()

  dispatch({
    type: stakingRoundActions.fetchStakingRound.type,
    payload: network,
  })
}

export const useStakingRoundByNetwork = (
  network: string
): Round | undefined => {
  return useAppSelector<Round | undefined>((state) =>
    selectStakingRound(state, network)
  )
}
