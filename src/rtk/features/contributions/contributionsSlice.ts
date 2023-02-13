import {
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/rootReducer'
import { CrowdloanContributions } from './types'
import { HYDRATE } from 'next-redux-wrapper'
import { FetchContributionProps } from './contributionsSaga'
import { RelayChain } from '../../../types/index'
import { stubFn, hydrateExtraReducer, upsertManyEntity } from '../../app/util'
import { isEmptyArray, isEmptyObj, isEmptyStr } from '@subsocial/utils'

export type ContributionsEntity = {
  /** An account address and relay chain by which we fetch contributions. */
  id: string
  loading: boolean
  contributions?: CrowdloanContributions
}

export type ContributionsRecord = Record<string, ContributionsEntity>

const contributionsAdapter = createEntityAdapter<ContributionsEntity>()

const selectorByAccount = contributionsAdapter.getSelectors()

export const selectContributions = (
  state: RootState,
  account: string,
  relayChain: RelayChain
) =>
  selectorByAccount.selectById(state.contributions, `${account}-${relayChain}`)

export const selectManyContributions = (state: RootState, relayChain: RelayChain, accounts?: string[]) => {
  if(!accounts || isEmptyArray(accounts)) return

  const contributions: ContributionsRecord = {}

  accounts.forEach(account => {
    if(!isEmptyStr(account)) {
      const balanceEntity = selectContributions(state, account, relayChain)

      if(balanceEntity) {
        contributions[account] = balanceEntity
      }
    }
  })

  return isEmptyObj(contributions) ? undefined : contributions
}

const slice = createSlice({
  name: 'contributions',
  initialState: contributionsAdapter.getInitialState(),
  reducers: {
    fetchContributions: (
      state,
      action: PayloadAction<FetchContributionProps>
    ) => {
      const { accounts, reload, relayChain } = action.payload

      upsertManyEntity({
        adapter: contributionsAdapter,
          state: state as EntityState<ContributionsEntity>,
          reload,
          fieldName: 'contributions',
          network: relayChain,
          accounts,
          selector: selectorByAccount
      })
      return
    },
    fetchContributionsSuccess: (
      state,
      action: PayloadAction<ContributionsEntity[]>
    ) => {
      contributionsAdapter.upsertMany(state, action.payload)
    },
    fetchContributionsFailed: stubFn,
  },
  extraReducers: {
    [HYDRATE]: hydrateExtraReducer('contributions'),
  },
})

export const contributionsActions = slice.actions

export default slice.reducer
