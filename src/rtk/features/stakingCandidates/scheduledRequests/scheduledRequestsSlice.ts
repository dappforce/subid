import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../../app/rootReducer'
import { HYDRATE } from 'next-redux-wrapper'
import { hydrateExtraReducer, FetchProps, toGenericAccountId, upsertManyEntity } from '../../../app/util'
import { isEmptyStr, isEmptyObj } from '@subsocial/utils'
import { EntityState } from '@reduxjs/toolkit'
import {
  ScheduledRequests,
  ScheduledRequestsByDelegatorEntityRecord,
  ScheduledRequestsByDelegatorRecord
} from './types'

export type ScheduledRequestsEntity = {
  id: string
  loading: boolean
  requests: ScheduledRequests[]
}

export type FetchScheduledRequestsProps = FetchProps & {
  network: string
}

const scheduledRequestsAdapter = createEntityAdapter<ScheduledRequestsEntity>()

const scheduledRequestsSelector = scheduledRequestsAdapter.getSelectors()

export const selectScheduledRequests = (state: RootState, account: string, network: string) =>
scheduledRequestsSelector.selectById(state.scheduledRequests, `${account}-${network}`)

export const selectManyScheduledRequests = (state: RootState, network: string, accounts?: string[]) => {
  const stakingCandidateInfo: ScheduledRequestsByDelegatorEntityRecord = {}

  accounts?.forEach(account => {
    if(!isEmptyStr(account)) {
      const scheduledRequestsEntity = selectScheduledRequests(state, account, network)

      if(scheduledRequestsEntity) {
        const { id, loading, requests } = scheduledRequestsEntity

        const scheduledRequestsByDelegator: ScheduledRequestsByDelegatorRecord = {}

        requests?.forEach(request => {
          scheduledRequestsByDelegator[toGenericAccountId(request.delegator)] = request
        })

        stakingCandidateInfo[account] = {
          id,
          loading,
          requests: scheduledRequestsByDelegator
        }
      }
    }
  })

  return isEmptyObj(stakingCandidateInfo) ? undefined : stakingCandidateInfo
}

const slice = createSlice({
  name: 'scheduledRequests',
  initialState: scheduledRequestsAdapter.getInitialState(),
  reducers: {
    fetchScheduledRequests: (state, action: PayloadAction<FetchScheduledRequestsProps>) => {
      const { accounts, reload, network } = action.payload

      upsertManyEntity({
        adapter: scheduledRequestsAdapter,
        state: state as EntityState<ScheduledRequestsEntity>,
        reload,
        fieldName: 'requests',
        subId: network,
        ids: accounts,
        selector: scheduledRequestsSelector
      })

      return
    },
    fetchScheduledRequestsSuccess: (state, action: PayloadAction<ScheduledRequestsEntity[]>) => {
      scheduledRequestsAdapter.upsertMany(state, action.payload)
    },
    fetchScheduledRequestsFailed: (state, action: PayloadAction<FetchScheduledRequestsProps>) => {
      const { accounts, reload = true, network } = action.payload

      upsertManyEntity({
        adapter: scheduledRequestsAdapter,
        state: state as EntityState<ScheduledRequestsEntity>,
        reload,
        loading: false,
        fieldName: 'state',
        ids: accounts,
        subId: network,
        selector: scheduledRequestsSelector
      })
      return
    },
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('scheduledRequests')
  },
})

export const scheduledRequestsActions = slice.actions

export default slice.reducer
