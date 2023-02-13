import { validatorsActions, selectStakingInfo, selectValidators, StakingInfoEntity } from './stakingInfoSlice'
import { useEffect } from 'react'
import { ValidatorInfo } from './types'
import { useAppSelector, useAppDispatch } from '../../../app/store'

export const useFetchStakingInfo = (network: string) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(validatorsActions.fetchStakingInfo({ network }))
  }, [ network ])
}

export const useStakingInfo = (network: string) => {
  return useAppSelector<StakingInfoEntity | undefined>((state: any) => selectStakingInfo(state, network))
}

type ValidatorsHookResult = {
  validators: ValidatorInfo[]
  loading?: boolean
}

export const useValidators = (network: string, accounts?: string[]) => {
  return useAppSelector<ValidatorsHookResult>((state: any) => selectValidators(state, network, accounts))
}