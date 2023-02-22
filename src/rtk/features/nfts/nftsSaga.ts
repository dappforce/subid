import { call, put, select, takeEvery } from '@redux-saga/core/effects'
import { getNtfsByAccount } from 'src/api'
import { PayloadAction } from '@reduxjs/toolkit'
import { nftsActions, selectNfts, NftsEntity } from './nftsSlice'
import { isDef } from '@subsocial/utils'
import { all } from 'redux-saga/effects'
import { FetchProps } from 'src/rtk/app/util'
import { log, isEmptyEntity } from '../../app/util'
import { Nfts } from './types'

/** Fetch NFTs owned by the account from the next networks: Kusama (RMRK), Statemine, Unique Network, Karura. */
function* fetchNftsWorker (action: PayloadAction<FetchProps>) {
  const { accounts, reload = false } = action.payload
  try {
    const fetchDataMap = accounts.map(function* (account) {
      if (!account) return

      const nftsEntity: NftsEntity = yield select(selectNfts, account)

      let nfts = nftsEntity?.nfts

      if (isEmptyEntity(nfts) || reload) {
        nfts = yield call(getNtfsByAccount, account)

        for ( const key in nfts ) {
          const nftKey = key as keyof Nfts

          nfts[nftKey] = nfts[nftKey]?.map((x) => ({ ...x, account, network: nftKey }))
        }
      }

      return { id: account, loading: false, nfts }
    })

    const nfts: NftsEntity[] = yield all(fetchDataMap)

    yield put(nftsActions.fetchNftsSuccess(nfts.filter(isDef)))
  } catch (error) {
    log.error('Failed to fetch NFTs from all supported networks', error)

    yield put(nftsActions.fetchNftsFailed())
  }
}

export function* watchNfts () {
  yield takeEvery(nftsActions.fetchNfts.type, fetchNftsWorker)
}
