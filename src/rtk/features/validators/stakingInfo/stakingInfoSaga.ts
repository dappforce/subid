import { call, put, takeLatest, select } from '@redux-saga/core/effects'
import { isEmptyObj, isDef } from '@subsocial/utils'
import { validatorsActions, selectStakingInfo, StakingInfoEntity } from './stakingInfoSlice'
import { ValidatorInfo, StakingInfo, StakingInfoProps } from './types'
import { PayloadAction } from '@reduxjs/toolkit'
import BN from 'bignumber.js'
import { ChainInfo } from '../../multiChainInfo/types'
import { selectChainInfoByNetwork } from '../../multiChainInfo/multiChainInfoSlice'
import { getValidatorsListByNetwork } from 'src/api'
import { calculateAPYByValidator } from '../../../../components/staking/validators/valculateAPY'
import { log } from '../../../app/util'

function* fetchStakingInfoWorker (action: PayloadAction<StakingInfoProps>) {
  const { reload, network } = action.payload

  try {
    const validatorsInfo: StakingInfoEntity = yield select(selectStakingInfo, network)

    if(!validatorsInfo?.stakingInfo || isEmptyObj(validatorsInfo.stakingInfo) || reload) {
      const chainInfo: ChainInfo = yield select(selectChainInfoByNetwork, network)

      const { totalIssuance } = chainInfo || {}

      const response: StakingInfo = yield call(getValidatorsListByNetwork, network)

      if(!response || isEmptyObj(response)) {
        yield put(validatorsActions.fetchStakingInfoFailed({ network }))
      }

      const { validators, totalStaked } = response

      const validatorsWithAPY: Record<string, ValidatorInfo> = {}
      
      const validatorsValues = validators ? Object.values(validators) : []
      
      const activeValidatorsLength = validatorsValues?.filter(x => x.isActive).length

      validators && Object.entries(validators).forEach(([ key, validator ]) => {
        const { bondTotal: total, commissionPer: commission, isActive } = validator

        const apy = isActive ? calculateAPYByValidator(
          total, 
          totalStaked, 
          activeValidatorsLength, 
          totalIssuance, 
          commission.toString()
        ) : undefined

        validatorsWithAPY[key] = {
          ...validator,
          apy,
          }
      })

      const APYs = Object.values(validatorsWithAPY).map(x => x.apy ? new BN(x.apy).toNumber() : undefined).filter(isDef)

      const maxAPY = Math.max(...APYs)

      response.validators = validatorsWithAPY
      response.maxAPY = maxAPY.toString()

      yield put(
        validatorsActions.fetchStakingInfoSuccess({ id: network, loading: false, stakingInfo: response })
      )
    }
  } catch (error) {
    log.error('Failed to fetch staking info', error)
  }
}

export function* watchStakingInfo () {
  yield takeLatest(validatorsActions.fetchStakingInfo.type, fetchStakingInfoWorker)
}
