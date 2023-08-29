import { AppDispatch, useAppSelector } from '../../../app/store'
import { selectStakingConsts, stakingConstsActions } from './stakingConstsSlice'

export const fetchStakingConsts = (dispatch: AppDispatch) => {
  dispatch(stakingConstsActions.fetchStakingConsts())
}

export const useStakingConsts = () => {
  return useAppSelector((state) => selectStakingConsts(state))
}
