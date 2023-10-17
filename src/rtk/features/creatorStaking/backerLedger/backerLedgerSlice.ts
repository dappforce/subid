import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from '../../../app/rootReducer'
import { hydrateExtraReducer, upsertOneEntity } from '../../../app/util'

type UnlockingChunk = {
  amount: string
  unlockEra: string
}

export type BackerLedger = {
  totalLocked: string
  locked: string
  unbondingInfo: {
    unlockingChunks: UnlockingChunk[]
  }
}

export type BackerLedgerEntity = {
  /** Parameters to fetch the fees, with format {type}-{params} */
  id: string
  loading: boolean
  ledger?: BackerLedger
}

const backerLedgerAdapter = createEntityAdapter<BackerLedgerEntity>()

const backerLedgerSelector = backerLedgerAdapter.getSelectors()

export const selectBackerLedger = (state: RootState, account: string) =>
  backerLedgerSelector.selectById(state.backerLedger, account)

export type FetchBackerLedgerProps = {
  reload?: boolean
  account: string
}

const slice = createSlice({
  name: 'backerLedger',
  initialState: backerLedgerAdapter.getInitialState(),
  reducers: {
    fetchBackerLedger: (state, action: PayloadAction<FetchBackerLedgerProps>) => {
      const { reload, account } = action.payload

      const feeData = backerLedgerSelector.selectById(state, account)

      upsertOneEntity({
        adapter: backerLedgerAdapter,
        state: state as EntityState<BackerLedgerEntity>,
        reload,
        fieldName: 'ledger',
        id: account,
        entity: feeData,
      })
    },
    fetchBackerLedgerSuccess: (
      state,
      action: PayloadAction<BackerLedgerEntity>
    ) => {
      backerLedgerAdapter.upsertOne(
        state as EntityState<BackerLedgerEntity>,
        action.payload
      )
    },
    fetchBackerLedgerFailed: (state, action: PayloadAction<FetchBackerLedgerProps>) => {
      const { account, reload = true } = action.payload

      const info = backerLedgerSelector.selectById(state, account)

      upsertOneEntity({
        adapter: backerLedgerAdapter,
        state: state as EntityState<BackerLedgerEntity>,
        reload,
        loading: false,
        fieldName: 'ledger',
        id: account,
        entity: info,
      })
      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('backerLedger')
  },
})

export const backerLedgerActions = slice.actions

export default slice.reducer
