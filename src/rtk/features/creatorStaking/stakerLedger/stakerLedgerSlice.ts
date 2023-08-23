import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from '../../../app/rootReducer';
import { hydrateExtraReducer, upsertOneEntity } from '../../../app/util'

type UnlockingChunk = {
  amount: string
  unlockEra: string
}

export type StakerLedger = {
  locked: string
  unbondingInfo: {
    unlockingChunks: UnlockingChunk[]
  }
}

export type StakerLedgerEntity = {
  /** Parameters to fetch the fees, with format {type}-{params} */
  id: string
  loading: boolean
  ledger?: StakerLedger
}

const stakerLedgerAdapter = createEntityAdapter<StakerLedgerEntity>()

const stakerLedgerSelector = stakerLedgerAdapter.getSelectors()

export const selectStakerLedger = (state: RootState, account: string) =>
  stakerLedgerSelector.selectById(state.stakerLedger, account)

export type FetchStakerLedgerProps = {
  reload?: boolean
  account: string
}

const slice = createSlice({
  name: 'stakerLedger',
  initialState: stakerLedgerAdapter.getInitialState(),
  reducers: {
    fetchStakerLedger: (state, action: PayloadAction<FetchStakerLedgerProps>) => {
      const { reload, account } = action.payload

      const feeData = stakerLedgerSelector.selectById(state, account)

      upsertOneEntity({
        adapter: stakerLedgerAdapter,
        state: state as EntityState<StakerLedgerEntity>,
        reload,
        fieldName: 'ledger',
        id: account,
        entity: feeData,
      })
    },
    fetchStakerLedgerSuccess: (
      state,
      action: PayloadAction<StakerLedgerEntity>
    ) => {
      stakerLedgerAdapter.upsertOne(
        state as EntityState<StakerLedgerEntity>,
        action.payload
      )
    },
    fetchStakerLedgerFailed: (state, action: PayloadAction<FetchStakerLedgerProps>) => {
      const { account, reload = true } = action.payload

      const info = stakerLedgerSelector.selectById(state, account)

      upsertOneEntity({
        adapter: stakerLedgerAdapter,
        state: state as EntityState<StakerLedgerEntity>,
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
    [HYDRATE]: hydrateExtraReducer('stakerLedger')
  },
})

export const stakerLedgerActions = slice.actions

export default slice.reducer
