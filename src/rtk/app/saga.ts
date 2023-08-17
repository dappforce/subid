import { all, fork } from 'redux-saga/effects'
import { watchChainInfoWithPrices, watchStakingConsts } from '../features/multiChainInfo/multiChainInfoSaga'
import { watchIdentities } from '../features/identities/identitiesSaga'
import { watchNfts } from '../features/nfts/nftsSaga'
import { watchPrices } from '../features/prices/pricesSaga'
import {
  watchBalances,
  watchBalancesByNetwork,
} from '../features/balances/balancesSaga'
import {
  watchContributions,
  watchDotsamaContributions,
} from '../features/contributions/contributionsSaga'
import { watchDotsamaCrowdloanInfo } from '../features/crowdloanInfo/crowdloanInfoSaga'
import { watchAssetsBalances } from '../features/assetsBalances/assetsBalancesSaga'
import { Task } from '@redux-saga/types'
import { Store } from 'redux'
import { watchOverviewAccounts } from '../features/interestingAccounts/interestingAccountsSaga'
import { watchSelectedCandidates } from '../features/stakingCandidates/selectedCandidates/selectedCandidatesSaga'
import { watchStakingCandidatesInfo } from '../features/stakingCandidates/candidatesInfo/stakingCandidatesInfoSaga'
import { watchCandidatesList } from '../features/stakingCandidates/stakingCandidatesList/stakingCandidatesListSaga'
import { watchStakingDelegatorState } from '../features/stakingDelegators/delegatorState/stakingDelegatorsStateSaga'
import { watchScheduledRequests } from '../features/stakingCandidates/scheduledRequests/scheduledRequestsSaga'
import { watchStakingRound } from '../features/stakingRound/stakingRoundSaga'
import { watchVestings } from '../features/vesting/vestingSaga'
import { watchStakingProps } from '../features/validators/stakingProps/stakingPropsSaga'
import { 
  watchNominatorInfo, 
  watchRewardDestination, 
  watchController, 
  watchStakingLadger, 
  watchNominators, 
  watchStakingLadgerAndNominators 
} from '../features/validators/nominatorInfo/nominatorInfoSaga'
import { watchStakingReward } from '../features/validators/rewards/rewardsSaga'
import { watchTransferFee } from '../features/fees/feesSaga'
import { watchStakingInfo } from '../features/validators/stakingInfo/stakingInfoSaga'
import { watchCreatorsList } from '../features/creatorStaking/creatorsList/creatorsListSaga';
import { watchGeneralEraInfo } from '../features/creatorStaking/generalEraInfo/generalEraInfoSaga';
import { watchCreatorsSpaces } from '../features/creatorStaking/creatorsSpaces/creatorsSpacesSaga';
import { watchEraStake } from '../features/creatorStaking/eraStake/eraStakeSaga';


export interface SagaStore extends Store {
  sagaTask?: Task
}

export default function* rootSaga () {
  const sagas = [
    watchIdentities,
    watchNfts,
    watchPrices,
    watchBalances,
    watchBalancesByNetwork,
    watchContributions,
    watchAssetsBalances,
    watchChainInfoWithPrices,
    watchDotsamaCrowdloanInfo,
    watchDotsamaContributions,
    watchOverviewAccounts,
    watchStakingCandidatesInfo,
    watchSelectedCandidates,
    watchStakingDelegatorState,
    watchCandidatesList,
    watchScheduledRequests,
    watchStakingRound,
    watchStakingConsts,
    watchVestings,
    watchTransferFee,
    watchStakingInfo,
    watchStakingProps,
    watchNominatorInfo,
    watchStakingReward,
    watchRewardDestination,
    watchController,
    watchNominators,
    watchStakingLadger,
    watchStakingLadgerAndNominators,
    watchCreatorsList,
    watchGeneralEraInfo,
    watchCreatorsSpaces,
    watchEraStake
  ]

  yield all(sagas.map((s) => fork(s)))
}
