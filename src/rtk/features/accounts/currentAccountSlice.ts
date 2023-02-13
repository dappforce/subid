import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer } from '../../app/util'

export type CurrentAccountEntity = {
  account: string
}

const initialState: CurrentAccountEntity = {
  account: ''
}

export const selectCurrentAccount = (state: RootState) => state.currentAccount.account

const slice = createSlice({
  name: 'currentAccount',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<string>) => {
      state.account = action.payload
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('currentAccount'),
  },
})

export const currentAccountActions = slice.actions

export default slice.reducer
