import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from '../../app/rootReducer'
import { stubFn, hydrateExtraReducer } from '../../app/util'
import { AccountCardType } from '../../../components/interesting-accounts/types'

export const overviewAccountId = 'overviewAccounts'

export type OverviewAccountsEntity = {
  id: string
  accounts: AccountCardType[]
}

const overviewAccountsAdapter = createEntityAdapter<OverviewAccountsEntity>()

const overviewAccountsSelector = overviewAccountsAdapter.getSelectors()

export const selectOverviewAccounts = (state: RootState) =>
  overviewAccountsSelector.selectById(state.overviewAccounts, overviewAccountId)?.accounts

const slice = createSlice({
  name: overviewAccountId,
  initialState: overviewAccountsAdapter.getInitialState(),
  reducers: {
    fetchOverviewAccounts: stubFn,
    fetchOverviewAccountsSuccess: (
      state,
      action: PayloadAction<OverviewAccountsEntity>
    ) => {
      overviewAccountsAdapter.upsertOne(state, action.payload)
    },
    fetchOverviewAccountsFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer(overviewAccountId)
  },
})

export const overviewAccountsActions = slice.actions

export default slice.reducer
