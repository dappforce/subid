import { StakingCandidate, StakingCandidateInfoRecord } from '../utils'
import { takeLatest, select, call, put } from '@redux-saga/core/effects'
import {
  stakingCandidatesInfoActions,
  StakingCandidatesInfoEntity,
} from './stakingCandidatesInfoSlice'
import { log, getIdsThatNeedToFetch } from '../../../app/util'
import { PayloadAction } from '@reduxjs/toolkit'
import { selectStakingCandidatesInfo, FetchCandidatesInfoProps } from './stakingCandidatesInfoSlice'
import { isEmptyArray } from '@subsocial/utils'
import { getCandidatesInfoByNetwork } from 'src/api'

function* fetchStakingCandidatesInfoWorker (
  action: PayloadAction<FetchCandidatesInfoProps>
) {
  const { network, accounts, reload } = action.payload

  try {
    const stakingCandidatesInfo: StakingCandidateInfoRecord = yield select(
      selectStakingCandidatesInfo,
      network,
      accounts
    )

    const needFetch = getIdsThatNeedToFetch(stakingCandidatesInfo, accounts, 'info')

    const accountsParam: string[] = reload
      ? accounts
      : needFetch

      if(!isEmptyArray(accountsParam)) {
      const info: StakingCandidate[] = yield call(
        getCandidatesInfoByNetwork,
        network,
        accountsParam
      )

      if (isEmptyArray(info)) return

      const candidatesInfo: StakingCandidatesInfoEntity[] = info.map(item => {
        return {
          id: item.id,
          loading: false,
          info: item
        }
      })

      yield put(stakingCandidatesInfoActions.fetchCandidatesInfoSuccess(candidatesInfo))
    }
  } catch (error) {
    log.error('Failed to fetch staking candidates', error)
  }
}

export function* watchStakingCandidatesInfo () {
  yield takeLatest(
    stakingCandidatesInfoActions.fetchCandidatesInfo.type,
    fetchStakingCandidatesInfoWorker
  )
}
