import {
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { stubFn, hydrateExtraReducer, upsertOneEntity } from '../../app/util'
import { FetchVestingProps } from './vestingSaga'

export type VestingData = {
  claimable: string
  remaining: string
}

export type VestingRecord = Record<string, VestingData>

export type VestingEntity = {
  /** An account address and network as the id. */
  id: string
  loading: boolean
  vestingData?: VestingData
}

const vestingAdapter = createEntityAdapter<VestingEntity>()

const selectorByAccount = vestingAdapter.getSelectors()

export const selectVesting = (
  state: RootState,
  account: string,
  network: string
) =>
  selectorByAccount.selectById(state.vesting, `${account}-${network}`)

const slice = createSlice({
  name: 'vesting',
  initialState: vestingAdapter.getInitialState(),
  reducers: {
    fetchVesting: (
      state,
      action: PayloadAction<FetchVestingProps>
    ) => {
      const { accounts, reload, networks } = action.payload

      accounts.forEach((account) => {
        networks.forEach((network) => {
          const id = `${account}-${network}`
          const vesting = selectorByAccount.selectById(state, id)
  
          upsertOneEntity({
            adapter: vestingAdapter,
            state: state as EntityState<VestingEntity>,
            reload,
            fieldName: 'vestingData',
            id,
            entity: vesting,
          })
        })
      })
    },
    fetchVestingSuccess: (
      state,
      action: PayloadAction<VestingEntity[]>
    ) => {
      vestingAdapter.upsertMany(state, action.payload)
    },
    fetchVestingFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('vesting'),
  },
})

export const vestingActions = slice.actions

export default slice.reducer
