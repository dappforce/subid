import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

export type AccountsEntity = {
  accounts: InjectedAccountWithMeta[]
}

const initialState: AccountsEntity = {
  accounts: []
}

export const selectAccounts = (state: RootState) => state.accounts.accounts

const slice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<InjectedAccountWithMeta[]>) => {
      state.accounts = action.payload
    },
  }
})

export const accountsActions = slice.actions

export default slice.reducer
