import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { StakingInfo, StakingInfoProps } from './types'
import { isDef } from '@subsocial/utils'
import { EntityState } from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { toGenericAccountId, upsertOneEntity, hydrateExtraReducer } from '../../../app/util'

export type StakingInfoEntity = {
  id: string
  loading: boolean
  stakingInfo: StakingInfo
}

const stakingInfoAdapter = createEntityAdapter<StakingInfoEntity>()

const stakingInfoSelector = stakingInfoAdapter.getSelectors()

export const selectStakingInfo = (state: RootState, network: string) =>
  stakingInfoSelector.selectById(state.stakingInfo, network)

export const selectValidators = (state: RootState, network: string, accounts?: string[]) => {
  const validatorsStakingInfo = selectStakingInfo(state, network)

  const { stakingInfo, loading } = validatorsStakingInfo || {}

  const { validators } = stakingInfo || {}

  const validatorsInfo = accounts?.map((account) => {
    return validators?.[toGenericAccountId(account)]
  }).filter(isDef) || []

  return {
    validators: validatorsInfo,
    loading
  }
}

const slice = createSlice({
  name: 'stakingInfo',
  initialState: stakingInfoAdapter.getInitialState(),
  reducers: {
    fetchStakingInfo:  (state, action: PayloadAction<StakingInfoProps>) =>{
      const { reload, network } = action.payload

      const stakingInfo = stakingInfoSelector.selectById(state, network)

      upsertOneEntity({
        adapter: stakingInfoAdapter,
        state: state as EntityState<StakingInfoEntity>,
        reload,
        fieldName: 'stakingInfo',
        id: network,
        entity: stakingInfo,
      })

      return
    },
    fetchStakingInfoSuccess: (state, action: PayloadAction<StakingInfoEntity>) => {
      stakingInfoAdapter.upsertOne(state, action.payload)
    },
    fetchStakingInfoFailed: (state, action: PayloadAction<StakingInfoProps>) => {
      const { reload = true, network } = action.payload

      const stakingInfo = stakingInfoSelector.selectById(state, network)

      upsertOneEntity({
        adapter: stakingInfoAdapter,
        state: state as EntityState<StakingInfoEntity>,
        reload,
        loading: false,
        fieldName: 'info',
        id: network,
        entity: stakingInfo,
      })
      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('stakingInfo')
  },
})

export const validatorsActions = slice.actions

export default slice.reducer
