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

export type EraStakeFetchProps = {
  reload?: boolean
  ids: string[]
  era: string
}

type EraStake = {
  totalStaked: string
  backersCount: string
  rewardsClaimed: false
}

export type EraStakeEntity = {
  id: string
  loading: boolean
  info?: EraStake
}

export type EraStakesBySpaceIdsRecord = Record<string, EraStake>

const eraStakeAdapter = createEntityAdapter<EraStakeEntity>()

const eraStakeSelector = eraStakeAdapter.getSelectors()

export const selectEraStake = (state: RootState, id?: string, era?: string) =>
  eraStakeSelector.selectById(state.eraStake, `${id}-${era}`)

export const selectEraStakesBySpaceIds = (
  state: RootState,
  ids?: string[],
  era?: string
) => {
  if (!ids || isEmptyArray(ids) || !era) return

  const eraStake: EraStakesBySpaceIdsRecord = {}

  ids.forEach((id) => {
    if (!isEmptyStr(id)) {
      const eraStakeEtity = selectEraStake(state, id, era)

      const eraStakeInfo = eraStakeEtity?.info

      if (eraStakeInfo) {
        eraStake[id] = eraStakeInfo
      }
    }
  })

  return eraStake
}

const slice = createSlice({
  name: 'eraStake',
  initialState: eraStakeAdapter.getInitialState(),
  reducers: {
    fetchEraStake: (state, action: PayloadAction<EraStakeFetchProps>) => {
      const { ids, reload, era } = action.payload

      upsertManyEntity({
        adapter: eraStakeAdapter,
        state: state as EntityState<EraStakeEntity>,
        reload,
        fieldName: 'info',
        ids: ids,
        subId: era,
        selector: eraStakeSelector,
      })
      return
    },
    fetchEraStakeSuccess: (state, action: PayloadAction<EraStakeEntity[]>) => {
      eraStakeAdapter.upsertMany(
        state as EntityState<EraStakeEntity>,
        action.payload
      )
    },
    fetchEraStakeFailed: (state, action: PayloadAction<EraStakeFetchProps>) => {
      const { ids, reload = true, era } = action.payload

      upsertManyEntity({
        adapter: eraStakeAdapter,
        state: state as EntityState<EraStakeEntity>,
        reload,
        loading: false,
        fieldName: 'info',
        ids: ids,
        subId: era,
        selector: eraStakeSelector,
      })

      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('eraStake'),
  },
})

export const eraStakeActions = slice.actions

export default slice.reducer
