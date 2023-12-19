import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'

import { isEmptyArray, isEmptyStr } from '@subsocial/utils'
import { RootState } from '../../../app/rootReducer'
import { hydrateExtraReducer, upsertManyEntity } from '../../../app/util'

export type SpacesFetchProps = {
  reload?: boolean
  ids: string[]
}

export type CreatorSpace = {
  id: string
  image: string
  hidden: boolean
  name: string
  about: string
  links: string[]
  domain: string
  email: string
  postsCount: string
  ownedByAccount: {
    id: string
  }
}

export type CreatorSpaceEntity = {
  id: string
  loading: boolean
  space?: CreatorSpace
}

export type CreatorsSpacesRecord = Record<string, CreatorSpace>

const creatorsSpacesAdapter = createEntityAdapter<CreatorSpaceEntity>()

const creatorsSpacesSelector = creatorsSpacesAdapter.getSelectors()

export const selectCreatorSpace = (state: RootState, id?: string) =>
  creatorsSpacesSelector.selectById(state.creatorsSpaces, id || '')

export const selectManySpaces = (state: RootState, ids?: string[]) => {
  if (!ids || isEmptyArray(ids)) return

  const creatorsSpaces: CreatorsSpacesRecord = {}

  ids.forEach((id) => {
    if (!isEmptyStr(id)) {
      const creatorsSpacesEtity = selectCreatorSpace(state, id)

      const space = creatorsSpacesEtity?.space

      if (space) {
        creatorsSpaces[id] = space
      }
    }
  })

  return creatorsSpaces
}

const slice = createSlice({
  name: 'creatorsSpaces',
  initialState: creatorsSpacesAdapter.getInitialState(),
  reducers: {
    fetchCreatorsSpaces: (state, action: PayloadAction<SpacesFetchProps>) => {
      const { ids, reload } = action.payload

      upsertManyEntity({
        adapter: creatorsSpacesAdapter,
        state: state as EntityState<CreatorSpaceEntity>,
        reload,
        fieldName: 'space',
        ids: ids,
        selector: creatorsSpacesSelector,
      })
      return
    },
    fetchCreatorsSpacesSuccess: (
      state,
      action: PayloadAction<CreatorSpaceEntity[]>
    ) => {
      creatorsSpacesAdapter.upsertMany(
        state as EntityState<CreatorSpaceEntity>,
        action.payload
      )
    },
    fetchCreatorsSpacesFailed: (state, action: PayloadAction<SpacesFetchProps>) => {
      const { ids, reload = true } = action.payload

      upsertManyEntity({
        adapter: creatorsSpacesAdapter,
        state: state as EntityState<CreatorSpaceEntity>,
        reload,
        loading: false,
        fieldName: 'space',
        ids: ids,
        selector: creatorsSpacesSelector,
      })

      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('creatorsSpaces'),
  },
})

export const creatorsSpacesActions = slice.actions

export default slice.reducer
