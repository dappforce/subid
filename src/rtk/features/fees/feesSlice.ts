import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { stubFn, hydrateExtraReducer, upsertOneEntity } from '../../app/util'
import { TransferFeeParams, generateTransferFeeId } from './utils'

export type FeeData = { amount: string; token: string }
export type FeesEntity = {
  /** Parameters to fetch the fees, with format {type}-{params} */
  id: string
  loading: boolean
  fee?: FeeData
}

const feesAdapter = createEntityAdapter<FeesEntity>()

const feesSelector = feesAdapter.getSelectors()

export const selectFee = (state: RootState, id: string) =>
  feesSelector.selectById(state.fees, id)

export type FetchTransferFeeParams = TransferFeeParams & { reload?: boolean }
const slice = createSlice({
  name: 'fees',
  initialState: feesAdapter.getInitialState(),
  reducers: {
    fetchTransferFee: (state, action: PayloadAction<FetchTransferFeeParams>) => {
      const { reload, ...params } = action.payload
      const id = generateTransferFeeId(params)
      const feeData = feesSelector.selectById(state, id)

      upsertOneEntity({
        adapter: feesAdapter,
        state: state as EntityState<FeesEntity>,
        reload,
        fieldName: 'fee',
        id,
        entity: feeData,
      })
    },
    fetchTransferFeeSuccess: (
      state,
      action: PayloadAction<FeesEntity>
    ) => {
      feesAdapter.upsertOne(
        state as EntityState<FeesEntity>,
        action.payload
      )
    },
    fetchTransferFeeFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('fees')
  },
})

export const feesActions = slice.actions

export default slice.reducer
