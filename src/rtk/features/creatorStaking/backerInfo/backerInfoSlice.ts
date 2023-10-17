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

export type BackerInfoProps = {
  reload?: boolean
  ids: string[]
  account: string
}

type BackerInfo = {
  id: string
  totalStaked: string
  stakes: any[]
}

export type BackerInfoEntity = {
  id: string
  loading: boolean
  info?: BackerInfo
}

export type BackerInfoRecord = Record<string, BackerInfo>

const backerInfoAdapter = createEntityAdapter<BackerInfoEntity>()

const backerInfoSelector = backerInfoAdapter.getSelectors()

export const selectBackerInfo = (state: RootState, id?: string, account?: string) =>
  backerInfoSelector.selectById(state.backerInfo, `${id}-${account}`)

export const selectBackerInfoBySpaces = (state: RootState, ids?: string[], account?: string) => {
  if (!ids || isEmptyArray(ids)) return

  const backerInfo: BackerInfoRecord = {}

  ids.forEach((id) => {
    if (!isEmptyStr(id)) {
      const backerInfoEtity = selectBackerInfo(state, id, account)

      const info = backerInfoEtity?.info

      if (info) {
        backerInfo[id] = info
      }
    }
  })

  return backerInfo
}

const slice = createSlice({
  name: 'backerInfo',
  initialState: backerInfoAdapter.getInitialState(),
  reducers: {
    fetchBackerInfo: (state, action: PayloadAction<BackerInfoProps>) => {
      const { ids, reload, account } = action.payload

      upsertManyEntity({
        adapter: backerInfoAdapter,
        state: state as EntityState<BackerInfoEntity>,
        reload,
        fieldName: 'info',
        ids: ids,
        subId: account,
        selector: backerInfoSelector,
      })
      return
    },
    fetchBackerInfoSuccess: (
      state,
      action: PayloadAction<BackerInfoEntity[]>
    ) => {
      backerInfoAdapter.upsertMany(
        state as EntityState<BackerInfoEntity>,
        action.payload
      )
    },
    fetchBackerInfoFailed: (state, action: PayloadAction<BackerInfoProps>) => {
      const { ids, reload = true, account } = action.payload

      upsertManyEntity({
        adapter: backerInfoAdapter,
        state: state as EntityState<BackerInfoEntity>,
        reload,
        loading: false,
        fieldName: 'info',
        ids: ids,
        subId: account,
        selector: backerInfoSelector,
      })

      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('backerInfo'),
  },
})

export const backerInfoActions = slice.actions

export default slice.reducer
