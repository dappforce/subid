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
import creatorsList from '../features/creatorStaking/creatorsList/creatorsListSlice'
import generalEraInfo from '../features/creatorStaking/generalEraInfo/generalEraInfoSlice'
import creatorsSpaces from '../features/creatorStaking/creatorsSpaces/creatorsSpacesSlice'
import eraStake from '../features/creatorStaking/eraStake/eraStakeSlice'
import stakerInfo from '../features/creatorStaking/stakerInfo/stakerInfoSlice'
import stakerLedger from '../features/creatorStaking/stakerLedger/stakerLedgerSlice'
import creatorStakingConsts from '../features/creatorStaking/stakingConsts/stakingConstsSlice'
import stakerRewards from '../features/creatorStaking/stakerRewards/stakerRewardsSlice'
import creatorRewards from '../features/creatorStaking/creatorRewards/creatorRewardsSlice'

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
  creatorsList,
  generalEraInfo,
  creatorsSpaces,
  eraStake,
  stakerInfo,
  stakerLedger,
  creatorStakingConsts,
  stakerRewards,
  creatorRewards
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
