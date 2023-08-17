import {
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { Nfts } from './types'
import { HYDRATE } from 'next-redux-wrapper'
import { FetchProps } from 'src/rtk/app/util'
import { stubFn, hydrateExtraReducer, upsertManyEntity } from '../../app/util'
import { isEmptyArray, isEmptyStr } from '@subsocial/utils'

export type NftsEntity = {
  /** An account address in Kusama format by which we fetch NFTs. */
  id: string
  loading: boolean
  nfts?: Nfts
}

export type NftsEntitiesRecord = Record<string, NftsEntity>

const nftsAdapter = createEntityAdapter<NftsEntity>()

const selectorByAccount = nftsAdapter.getSelectors()

export const selectNfts = (state: RootState, account: string) =>
  selectorByAccount.selectById(state.nfts, account)

export const selectManyNfts = (state: RootState, accounts?: string[]): Partial<NftsEntity> => {
  if (!accounts || isEmptyArray(accounts)) return {}

  const nftsObj: Partial<Nfts> = {}

  let nftsLoading = false

  accounts.forEach((account) => {
    if (!isEmptyStr(account)) {
      const nftsEntity = selectNfts(state, account)

      if (nftsEntity) {
        const { nfts, loading } = nftsEntity

        for (const key in nfts) {
          const nftKey = key as keyof Nfts

          const nftsByKey = nftsObj[nftKey] || []

          nftsByKey.push(...(nfts[nftKey] || []))

          nftsObj[nftKey] = nftsByKey
        }

        if (loading) {
          nftsLoading = loading
        }
      }
    }
  })

  return {
    nfts: nftsObj as Nfts,
    loading: nftsLoading
  }
}

const slice = createSlice({
  name: 'nfts',
  initialState: nftsAdapter.getInitialState(),
  reducers: {
    fetchNfts: (state, action: PayloadAction<FetchProps>) => {
      const { accounts, reload } = action.payload

      upsertManyEntity({
        adapter: nftsAdapter,
        state: state as EntityState<NftsEntity>,
        reload,
        fieldName: 'nfts',
        ids: accounts,
        selector: selectorByAccount
      })
      return
    },
    fetchNftsSuccess (state, action: PayloadAction<NftsEntity[]>) {
      nftsAdapter.upsertMany(state, action.payload)
    },
    fetchNftsFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('nfts'),
  },
})

export const nftsActions = slice.actions

export default slice.reducer
