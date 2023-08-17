import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { creatorsSpacesActions, selectCreatorSpace, selectManySpaces } from './creatorsSpacesSlice';

export const useFetchCreatorsSpaces = (ids?: string[]) => {
  const dispatch = useAppDispatch()

  
  useEffect(() => {
    if(!ids) return

    dispatch(
      creatorsSpacesActions.fetchCreatorsSpaces({
        ids,
        reload: false,
      })
    )
  }, [ ids?.join() ])

  
}

export const useCreatorSpaceById = (id?: string) => {
  return useAppSelector((state) => selectCreatorSpace(state, id))
}

export const useCreatorSpaceByIds = (ids?: string[]) => {
  return useAppSelector((state) => selectManySpaces(state, ids))
}
