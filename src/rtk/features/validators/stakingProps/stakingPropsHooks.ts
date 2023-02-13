import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { stakingPropsActions, StakingProps, selectStakingProps } from './stakingPropsSlice'

export const useFetchStakingProps = (network: string) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(stakingPropsActions.fetchStakingProps(network))
  }, [ network ])
}

export const useStakingProps = (network: string) => {
  return useAppSelector<StakingProps | undefined>((state: any) => selectStakingProps(state, network))
}
