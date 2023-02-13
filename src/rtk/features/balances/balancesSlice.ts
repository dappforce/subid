import {
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { AccountInfoItem } from '../../../components/identity/types'
import { HYDRATE } from 'next-redux-wrapper'
import { isEmptyArray, isEmptyObj, isEmptyStr } from '@subsocial/utils'
import { upsertManyEntity } from '../../app/util'
import {
  FetchProps,
  stubFn,
  hydrateExtraReducer,
} from '../../app/util'


export type BalancesEntity = {
  /** An account address by which we fetch chains balances. */
  id: string
  loading: boolean
  balances?: AccountInfoItem[]
}

export type BalanceEntityRecord = Record<string, BalancesEntity>

const balancesAdapter = createEntityAdapter<BalancesEntity>()

const selectorByAccount = balancesAdapter.getSelectors()

export const selectBalances = (state: RootState, account: string) =>
  selectorByAccount.selectById(state.balances, account)

export const selectManyBalances = (state: RootState, accounts?: string[]) => {
  if(!accounts || isEmptyArray(accounts)) return

  const balances: BalanceEntityRecord = {}

  accounts.forEach(account => {
    if(!isEmptyStr(account)) {
      const balanceEntity = selectBalances(state, account)

      if(balanceEntity) {
        balances[account] = balanceEntity
      }
    }
  })

  return isEmptyObj(balances) ? undefined : balances
}

export type FetchBalanceByNetworkProps = {
  accounts: string[]
  network?: string
}

const slice = createSlice({
  name: 'balances',
  initialState: balancesAdapter.getInitialState(),
  reducers: {
    fetchBalanceByNetwork: (
      state,
      action: PayloadAction<FetchBalanceByNetworkProps>
    ) => {
      const { accounts } = action.payload

      upsertManyEntity({
        adapter: balancesAdapter,
        state: state as EntityState<BalancesEntity>,
        reload: true,
        fieldName: 'balances',
        accounts,
        selector: selectorByAccount
      })
      return
    },
    fetchBalances: (state, action: PayloadAction<FetchProps>) => {
      const { accounts, reload } = action.payload

      upsertManyEntity({
        adapter: balancesAdapter,
        state: state as EntityState<BalancesEntity>,
        reload,
        fieldName: 'balances',
        accounts,
        selector: selectorByAccount
      })
      return
    },
    fetchBalancesSuccess: (state, action: PayloadAction<BalancesEntity[]>) => {
      balancesAdapter.upsertMany(state, action.payload)
    },
    fetchBalancesFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('balances'),
  },
})

export const balancesActions = slice.actions

export default slice.reducer
