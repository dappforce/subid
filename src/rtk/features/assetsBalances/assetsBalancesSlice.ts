import {
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { AssetsBalances } from './types'
import { HYDRATE } from 'next-redux-wrapper'
import { FetchProps } from 'src/rtk/app/util'
import { stubFn, hydrateExtraReducer, upsertOneEntity } from '../../app/util'
import { isEmptyArray, isEmptyObj, isEmptyStr } from '@subsocial/utils'

export type AssetsBalancesEntity = {
  /** An account address by which we fetch assets' balances. */
  id: string
  loading: boolean
  assetsBalances?: AssetsBalances
}

export type AssetsBalancesRecord = Record<string, AssetsBalancesEntity>

const assetsBalancesAdapter = createEntityAdapter<AssetsBalancesEntity>()

const selectorByAccount = assetsBalancesAdapter.getSelectors()

export const selectAssetsBalances = (state: RootState, account: string) =>
  selectorByAccount.selectById(state.assetsBalances, account)

export const selectManyAssetsBalances = (state: RootState, accounts?: string[]) => {
  if(!accounts || isEmptyArray(accounts)) return

  const assetsBalances: AssetsBalancesRecord = {}

  accounts.forEach(account => {
    if(!isEmptyStr(account)) {
      const assetsBalancesEntity = selectAssetsBalances(state, account)

      if(assetsBalancesEntity) {
        assetsBalances[account] = assetsBalancesEntity
      }
    }
  })

  return isEmptyObj(assetsBalances) ? undefined : assetsBalances
}

const slice = createSlice({
  name: 'assetsBalances',
  initialState: assetsBalancesAdapter.getInitialState(),
  reducers: {
    fetchAssetsBalances: (state, action: PayloadAction<FetchProps>) => {
      const { accounts, reload } = action.payload

      accounts.forEach((account) => {
        const assetsBalance = selectorByAccount.selectById(state, account)

        upsertOneEntity({
          adapter: assetsBalancesAdapter,
          state: state as EntityState<AssetsBalancesEntity>,
          reload,
          fieldName: 'contributions',
          id: account,
          entity: assetsBalance,
        })
      })

      return
    },
    fetchAssetsBalancesSuccess: (
      state,
      action: PayloadAction<AssetsBalancesEntity[]>
    ) => {
      assetsBalancesAdapter.upsertMany(state, action.payload)
    },
    fetchAssetsBalancesFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('assetsBalances')
  },
})

export const assetsBalancesActions = slice.actions

export default slice.reducer
