import { combineReducers } from '@reduxjs/toolkit'
import multiChainInfo from '../features/multiChainInfo/multiChainInfoSlice'
import nfts from '../features/nfts/nftsSlice'
import identities from '../features/identities/identitiesSlice'
import prices from '../features/prices/pricesSlice'
import accounts from '../features/accounts/accountsSlice'
import balances from '../features/balances/balancesSlice'
import contributions from '../features/contributions/contributionsSlice'
import crowdloanInfo from '../features/crowdloanInfo/crowdloanInfoSlice'
import assetsBalances from '../features/assetsBalances/assetsBalancesSlice'
import networkByParaId from '../features/multiChainInfo/networkByParaId'
import currentAccount from '../features/accounts/currentAccountSlice'
import overviewAccounts from '../features/interestingAccounts/interestingAccountsSlice'
import stakingCandidatesInfo from '../features/stakingCandidates/candidatesInfo/stakingCandidatesInfoSlice'
import selectedCandidates from '../features/stakingCandidates/selectedCandidates/selectedCandidatesSlice'
import candidatesList from '../features/stakingCandidates/stakingCandidatesList/stakingCandidatesListSlice'
import stakingDelegatorState from '../features/stakingDelegators/delegatorState/stakingDelegatorsStateSlice'
import scheduledRequests from '../features/stakingCandidates/scheduledRequests/scheduledRequestsSlice'
import stakingRound from '../features/stakingRound/stakingRoundSlice'
import vesting from '../features/vesting/vestingSlice'
import stakingInfo from '../features/validators/stakingInfo/stakingInfoSlice'
import stakingProps from '../features/validators/stakingProps/stakingPropsSlice'
import nominatorInfo from '../features/validators/nominatorInfo/nominatorInfoSlice'
import stakingReward from '../features/validators/rewards/rewardsSlice'
import fees from '../features/fees/feesSlice'
import chat from '../features/chat/chatSlice'

const rootReducer = combineReducers({
  currentAccount,
  multiChainInfo,
  nfts,
  identities,
  prices,
  accounts,
  balances,
  contributions,
  crowdloanInfo,
  assetsBalances,
  networkByParaId,
  overviewAccounts,
  stakingCandidatesInfo,
  selectedCandidates,
  candidatesList,
  stakingDelegatorState,
  scheduledRequests,
  stakingRound,
  vesting,
  stakingInfo,
  stakingProps,
  nominatorInfo,
  stakingReward,
  fees,
  chat
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
