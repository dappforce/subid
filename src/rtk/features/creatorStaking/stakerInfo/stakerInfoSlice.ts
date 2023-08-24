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

export type StakerInfoProps = {
  reload?: boolean
  ids: string[]
  account: string
}

type StakerInfo = {
  id: string
  totalStaked: string
}

export type StakerInfoEntity = {
  id: string
  loading: boolean
  info?: StakerInfo
}

export type StakerInfoRecord = Record<string, StakerInfo>

const stakerInfoAdapter = createEntityAdapter<StakerInfoEntity>()

const stakerInfoSelector = stakerInfoAdapter.getSelectors()

export const selectStakerInfo = (state: RootState, id?: string, account?: string) =>
  stakerInfoSelector.selectById(state.stakerInfo, `${id}-${account}`)

export const selectStakerInfoBySpaces = (state: RootState, ids?: string[], account?: string) => {
  if (!ids || isEmptyArray(ids)) return

  const stakerInfo: StakerInfoRecord = {}

  ids.forEach((id) => {
    if (!isEmptyStr(id)) {
      const stakerInfoEtity = selectStakerInfo(state, id, account)

      const info = stakerInfoEtity?.info

      if (info) {
        stakerInfo[id] = info
      }
    }
  })

  return stakerInfo
}

const slice = createSlice({
  name: 'stakerInfo',
  initialState: stakerInfoAdapter.getInitialState(),
  reducers: {
    fetchStakerInfo: (state, action: PayloadAction<StakerInfoProps>) => {
      const { ids, reload, account } = action.payload

      upsertManyEntity({
        adapter: stakerInfoAdapter,
        state: state as EntityState<StakerInfoEntity>,
        reload,
        fieldName: 'info',
        ids: ids,
        subId: account,
        selector: stakerInfoSelector,
      })
      return
    },
    fetchStakerInfoSuccess: (
      state,
      action: PayloadAction<StakerInfoEntity[]>
    ) => {
      stakerInfoAdapter.upsertMany(
        state as EntityState<StakerInfoEntity>,
        action.payload
      )
    },
    fetchStakerInfoFailed: (state, action: PayloadAction<StakerInfoProps>) => {
      const { ids, reload = true, account } = action.payload

      upsertManyEntity({
        adapter: stakerInfoAdapter,
        state: state as EntityState<StakerInfoEntity>,
        reload,
        loading: false,
        fieldName: 'info',
        ids: ids,
        subId: account,
        selector: stakerInfoSelector,
      })

      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('stakerInfo'),
  },
})

export const stakerInfoActions = slice.actions

export default slice.reducer
