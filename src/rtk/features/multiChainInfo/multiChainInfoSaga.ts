import { call, put, select, takeLatest } from '@redux-saga/core/effects'
import {
  chainInfoActions,
  selectChainInfoList,
} from './multiChainInfoSlice'
import { getChainsInfo, getStakingConstsByNetwork } from '../../../components/utils/OffchainUtils'
import { isEmptyObj } from '@subsocial/utils'
import { MultiChainInfo, ChainInfo, StakingConsts } from './types'
import { fetchPricesWorker } from '../prices/pricesSaga'
import { getChainsNamesForCoinGecko } from '../prices/pricesHooks'
import { FETCH_CHIAN_INFO_WITH_PRICES } from '../../app/actions'
import { log } from '../../app/util'
import { networkByParaIdActions, NetworkByParaId } from './networkByParaId'
import { PayloadAction } from '@reduxjs/toolkit'
import { selectChainInfoByNetwork } from './multiChainInfoSlice'

function* fetchChainInfoWorker () {
  try {
    const chainInfo: MultiChainInfo = yield select(selectChainInfoList)

    if (!isEmptyObj(chainInfo)) return

    const response: MultiChainInfo = yield call(getChainsInfo)

    const chainInfoEntity = Object.entries(response).map(([ id, info ]) => {
      return {
        ...info,
        id,
      }
    })

    yield put(chainInfoActions.fetchChainInfoSuccess(chainInfoEntity))

  } catch (error) {
    log.error('Failed to fetch info of multiple chains', error)

    yield put(chainInfoActions.fetchChainInfoFailed())
  }
}

function* storeNetworkByParaId (action: PayloadAction<MultiChainInfo>) {
  const chainsInfo = action.payload

  if(isEmptyObj(chainsInfo)) return

  try {
    const chainInfoValues = Object.values(chainsInfo)

    const networkByParaId: NetworkByParaId = {}

    chainInfoValues.map(({ paraId, id, relayChain }) => {
      if(paraId && relayChain) {
        networkByParaId[`${paraId}-${relayChain}`] = id
      }
    })

    yield put(networkByParaIdActions.storeNetworkByParaId(networkByParaId))
  } catch (err) {
    log.error('Failed to store network by para id', err)
  }
}

function* fetchChainInfoWithPriceWorker () {
  yield fetchChainInfoWorker()

  const chainInfo: MultiChainInfo = yield select(selectChainInfoList)
  const chainsInfoNames = getChainsNamesForCoinGecko(chainInfo)

  yield storeNetworkByParaId({ payload: chainInfo, type: '' })
  yield fetchPricesWorker({ payload: chainsInfoNames, type: '' })
}


export function* watchChainInfoWithPrices () {
  yield takeLatest(FETCH_CHIAN_INFO_WITH_PRICES, fetchChainInfoWithPriceWorker)
}

function* fetchStakingConstsWithChainInfo (action: PayloadAction<string>) {
  yield fetchChainInfoWorker()

  const network = action.payload

  try {
    const chainInfoByNetwork: ChainInfo = yield select(selectChainInfoByNetwork, network)

    if (chainInfoByNetwork && !isEmptyObj(chainInfoByNetwork?.staking)) return

    const response: StakingConsts = yield call(getStakingConstsByNetwork, network)

    const newChainInfo = {
      ...chainInfoByNetwork,
      staking: response,
    }

    yield put(chainInfoActions.fetchStakingConstsSuccess(newChainInfo))

  } catch (error) {
    log.error('Failed to fetch info of multiple chains', error)

    yield put(chainInfoActions.fetchChainInfoFailed())
  }
}

export function* watchStakingConsts () {
  yield takeLatest(chainInfoActions.fetchStakingConsts.type, fetchStakingConstsWithChainInfo)
}