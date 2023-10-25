import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import {
  hydrateExtraReducer,
  FetchProps,
} from '../../app/util'
import { isEmptyArray, isEmptyStr } from '@subsocial/utils'
import { AccountIdentities } from '../../../components/identity/types'
import { upsertManyEntity } from '../../app/util'

export type IdentitiesEntity = {
  /** An account address by which we fetch identities. */
  id: string
  loading: boolean
  identity?: AccountIdentities
}

export type AccountIdentitiesRecord = Record<string, AccountIdentities>

const identityAdapter = createEntityAdapter<IdentitiesEntity>()

const identitySelector = identityAdapter.getSelectors()

export const selectIdentities = (state: RootState, account: string) =>
  identitySelector.selectById(state.identities, account)

export const selectManyIdentities = (state: RootState, accounts?: string[]) => {
  if (!accounts || isEmptyArray(accounts)) return

  const identities: AccountIdentitiesRecord = {}

  accounts.forEach((account) => {
    if (!isEmptyStr(account)) {
      const identitiesEntity = selectIdentities(state, account)

      const accountIdentities = identitiesEntity?.identity

      identities[account] = accountIdentities || {}
    }
  })

  return identities
}

const slice = createSlice({
  name: 'identities',
  initialState: identityAdapter.getInitialState(),
  reducers: {
    fetchIdentities: (state, action: PayloadAction<FetchProps>) => {
      const { accounts, reload } = action.payload

      upsertManyEntity({
        adapter: identityAdapter,
        state: state as EntityState<IdentitiesEntity>,
        reload,
        fieldName: 'identity',
        ids: accounts,
        selector: identitySelector
      })
      return
    },
    fetchIdentitiesSuccess: (
      state,
      action: PayloadAction<IdentitiesEntity[]>
    ) => {
      identityAdapter.upsertMany(
        state as EntityState<IdentitiesEntity>,
        action.payload
      )
    },
    fetchIdentitiesFailed: (state, action: PayloadAction<FetchProps>) => {
      const { accounts, reload = true } = action.payload

      upsertManyEntity({
        adapter: identityAdapter,
        state: state as EntityState<IdentitiesEntity>,
        reload,
        loading: false,
        fieldName: 'identity',
        ids: accounts,
        selector: identitySelector
      })

      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('identities'),
  },
})

export const identitiesActions = slice.actions

export default slice.reducer
