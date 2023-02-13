import { takeLatest, select, call, put } from '@redux-saga/core/effects'
import { log, toGenericAccountId } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { isEmptyObj, isEmptyArray } from '@subsocial/utils'
import { RewardDestination } from '../../../../components/staking/validators/contexts/NominatingContext'
import { 
  FETCH_REWARD_DESTINATION, 
  FETCH_STAKING_LEDGER, 
  FETCH_NOMINATORS, 
  FETCH_CONTROLLER, 
  FETCH_STAKING_LADGER_AND_NOMINATORS 
} from './nominatorInfoHooks'
import { 
  getNominatorsInfo, 
  getRewardDestination, 
  getController, 
  getStakingLedger, 
  getNominators 
} from '../../../../components/utils/OffchainUtils'
import { 
  NominatorInfo, 
  FetchNominatorInfoProps, 
  StakingLedger 
} from './types'
import {
  StakingNominatorInfoEntity,
  selectStakingNominatorInfo,
  stakingNominatorInfoActions,
} from './nominatorInfoSlice'

function* fetchNominatorInfoWorker (
  action: PayloadAction<FetchNominatorInfoProps>
) {
  const { network, account, reload } = action.payload

  try {
    const stakingCandidatesInfo: StakingNominatorInfoEntity = yield select(
      selectStakingNominatorInfo,
      network,
      account
    )

    if (isEmptyObj(stakingCandidatesInfo.info) || reload) {
      const info: NominatorInfo = yield call(
        getNominatorsInfo,
        network,
        account
      )

      if (!info || isEmptyObj(info)) {
        yield put(
          stakingNominatorInfoActions.fetcNominatorInfoFailed({
            account: toGenericAccountId(account),
            network,
          })
        )
      }
  
      yield put(
        stakingNominatorInfoActions.fetchNominatorInfoSuccess({
          id: `${toGenericAccountId(info.accountId)}-${network}`,
          loading: false,
          info: info,
        })
      )
    }

  } catch (error) {
    log.error('Failed to fetch staking nominator info', error)
  }
}

function* fetchRewardDestinationWorker (
  action: PayloadAction<FetchNominatorInfoProps>
) {
  const { network, account, reload } = action.payload

  try {
    const stakingNominatorInfo: StakingNominatorInfoEntity = yield select(
      selectStakingNominatorInfo,
      account,
      network
    )


    if (isEmptyObj(stakingNominatorInfo?.info?.rewardDestination) || reload) {
      const rewardDestination: RewardDestination = yield call(
        getRewardDestination,
        network,
        account
      )
  
      if(!rewardDestination || !stakingNominatorInfo) return

      const { id, loading, info } = stakingNominatorInfo

      const newNominatorInfo = {
        id,
        loading,
        info: {
          ...info,
          rewardDestination: rewardDestination
        }
      }
      
      yield put(
        stakingNominatorInfoActions.fetchRewardDestinationSuccess(newNominatorInfo)
      )
    }

  } catch (error) {
    log.error('Failed to fetch staking reward destination info', error)
  }
}

function* fetchControllerWorker (
  action: PayloadAction<FetchNominatorInfoProps>
) {
  const { network, account, reload } = action.payload

  try {
    const stakingNominatorInfo: StakingNominatorInfoEntity = yield select(
      selectStakingNominatorInfo,
      account,
      network
    )


    if (!stakingNominatorInfo?.info?.controllerId || reload) {
      const controller: string | undefined = yield call(
        getController,
        network,
        account
      )
  
      if(!controller || !stakingNominatorInfo) return

      const { id, loading, info } = stakingNominatorInfo

      const newNominatorInfo = {
        id,
        loading,
        info: {
          ...info,
          controllerId: controller
        }
      }
      
      yield put(
        stakingNominatorInfoActions.fetchControllerSuccess(newNominatorInfo)
      )
    }

  } catch (error) {
    log.error('Failed to fetch staking controller id', error)
  }
}

function* fetchStakingLedgerWorker (
  action: PayloadAction<FetchNominatorInfoProps>
) {
  const { network, account, reload } = action.payload

  try {
    const stakingNominatorInfo: StakingNominatorInfoEntity = yield select(
      selectStakingNominatorInfo,
      account,
      network
    )


    if (isEmptyObj(stakingNominatorInfo?.info?.stakingLedger) || reload) {
      const stakingLedger: StakingLedger = yield call(
        getStakingLedger,
        network,
        stakingNominatorInfo.info.controllerId
      )
  
      if(!stakingLedger || !stakingNominatorInfo) return

      const { id, loading, info } = stakingNominatorInfo

      const newNominatorInfo = {
        id,
        loading,
        info: {
          ...info,
          stakingLedger
        }
      }
      
      yield put(
        stakingNominatorInfoActions.fetchStakingLadgerSuccess(newNominatorInfo)
      )
    }

  } catch (error) {
    log.error('Failed to fetch staking ledger', error)
  }
}

function* fetchStakingNominatorsWorker (
  action: PayloadAction<FetchNominatorInfoProps>
) {
  const { network, account, reload } = action.payload

  try {
    const stakingNominatorInfo: StakingNominatorInfoEntity = yield select(
      selectStakingNominatorInfo,
      account,
      network
    )

    const nominators = stakingNominatorInfo?.info?.nominators

    if (isEmptyArray(nominators) || reload) {
      const stakingNominators: string[] | undefined = yield call(
        getNominators,
        network,
        account
      )

      if(!stakingNominators || !stakingNominatorInfo) return

      const { id, loading, info } = stakingNominatorInfo

      const newNominatorInfo = {
        id,
        loading,
        info: {
          ...info,
          nominators: stakingNominators
        }
      }
      
      yield put(
        stakingNominatorInfoActions.fetchNominatorsSuccess(newNominatorInfo)
      )
    }

  } catch (error) {
    log.error('Failed to fetch staking nominators', error)
  }
}

export function* watchNominatorInfo () {
  yield takeLatest(
    stakingNominatorInfoActions.fetchNominatorInfo.type,
    fetchNominatorInfoWorker
  )
}

export function* fetchStakingLadgerAndNominatorsWorker (
  action: PayloadAction<FetchNominatorInfoProps>
) {
  yield fetchStakingLedgerWorker(action)
  yield fetchStakingNominatorsWorker(action)

}

export function* watchStakingLadgerAndNominators () {
  yield takeLatest(
    FETCH_STAKING_LADGER_AND_NOMINATORS,
    fetchStakingLadgerAndNominatorsWorker
  )

  yield takeLatest(
    FETCH_NOMINATORS,
    fetchStakingNominatorsWorker
  )
}

export function* watchController () {
  yield takeLatest(
    FETCH_CONTROLLER,
    fetchControllerWorker
  )
}

export function* watchNominators () {
  yield takeLatest(
    FETCH_NOMINATORS,
    fetchStakingNominatorsWorker
  )
}

export function* watchRewardDestination () {
  yield takeLatest(
    FETCH_REWARD_DESTINATION,
    fetchRewardDestinationWorker
  )
}

export function* watchStakingLadger () {
  yield takeLatest(
    FETCH_STAKING_LEDGER,
    fetchStakingLedgerWorker
  )
}
