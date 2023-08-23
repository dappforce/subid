import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { eraStakeActions, selectEraStake } from './eraStakeSlice'

export const fetchEraStakes = (dispatch: any, ids: string[], era: string) => {
  dispatch(
    eraStakeActions.fetchEraStake({
      ids,
      era,
      reload: true,
    })
  )
}

export const useFetchEraStakes = (ids?: string[], era?: string) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if(!ids || !era) return

    dispatch(
      eraStakeActions.fetchEraStake({
        ids,
        era,
        reload: false,
      })
    )
  }, [ ids?.join(), era ])
}

export const useEraStakesById = (id?: string, era?: string) => {
  return useAppSelector((state) => selectEraStake(state, id, era))
}
