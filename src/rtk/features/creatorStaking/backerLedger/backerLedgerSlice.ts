import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from '../../../app/rootReducer'
import { hydrateExtraReducer, upsertOneEntity } from '../../../app/util'

type UnbondingChunks = {
  amount: string
  unlockEra: string
}

export type BackerLedger = {
  totalLocked: string
  locked: string
  unbondingInfo: {
    unbondingChunks: UnbondingChunks[]
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

      const ledger = backerLedgerSelector.selectById(state, account)

      upsertOneEntity({
        adapter: backerLedgerAdapter,
        state: state as EntityState<BackerLedgerEntity>,
        reload,
        fieldName: 'ledger',
        id: account,
        entity: ledger,
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
      return
    },
    fetchBackerLedgerFailed: (state, action: PayloadAction<FetchBackerLedgerProps>) => {
      const { account, reload = true } = action.payload

      const ledger = backerLedgerSelector.selectById(state, account)

      upsertOneEntity({
        adapter: backerLedgerAdapter,
        state: state as EntityState<BackerLedgerEntity>,
        reload,
        loading: false,
        fieldName: 'ledger',
        id: account,
        entity: ledger,
      })
      return
    },
  },

})

export const backerLedgerActions = slice.actions

export default slice.reducer
