import { FormInstance, Card, Space, Skeleton, Collapse } from 'antd'
import BN from 'bignumber.js'
import { getBalanceWithDecimal } from '../../common/balances/utils'
import { DelegatorState } from '../../../rtk/features/stakingDelegators/delegatorState/types'
import { StakingCandidate } from '../../../rtk/features/stakingCandidates/utils'
import { ApiPromise } from '@polkadot/api'
import { Action } from './stakeModal/StakingActionButtons'
import {
  useFetchCandidatesInfo,
  useFetchSceduledRequests,
  useManyScheduledRequestsByNetwork
} from '../../../rtk/features/stakingCandidates/stakingCandidatesHooks'
import { useFetchStakingDelegatorsState } from '../../../rtk/features/stakingDelegators/stakingDelegatorHooks'
import { CollatorStakingInfo } from '../types'
import { Round } from '../../../rtk/features/stakingRound/types'
import { useFetchBalances, fetchBalanceByNetwork } from '../../../rtk/features/balances/balancesHooks'
import { AppDispatch } from '../../../rtk/app/store'
import { scheduledRequestsActions } from '../../../rtk/features/stakingCandidates/scheduledRequests/scheduledRequestsSlice'
import { stakingDelegatorStateActions } from '../../../rtk/features/stakingDelegators/delegatorState/stakingDelegatorsStateSlice'
import { stakingCandidatesInfoActions } from '../../../rtk/features/stakingCandidates/candidatesInfo/stakingCandidatesInfoSlice'
import { MutedDiv } from '../../utils/MutedText'
import styles from './StakingTable.module.sass'
import { isEmptyArray, SubDate } from '@subsocial/utils'
import NoData from '../../utils/EmptyList'
import { TFunction } from 'i18next'
import { useState } from 'react'
import { getBalanceWithDecimals } from '../utils'
import { BalanceView } from 'src/components/homePage/address-views/utils'
import { StakingContextState } from '../../staking/collators/StakingContext'
import { getNextRoundDate } from '../../staking/collators/utils'
import { BIGNUMBER_ZERO } from '../../../config/app/consts'

export type StakingTabKey = 'active' | 'waiting'

export type StakingTab = {
  key: StakingTabKey
  label: string
}

type FormFields = {
  delegator: string
  amount: string
  currency: string
}

export const fieldName = (name: keyof FormFields) => name

export const setAndValidateField = (form: FormInstance, name: string, value?: string) => {
  form.setFields([ { name, value } ])
  form.validateFields([ name ]).catch(({ errorFields }) => {
    form.setFields(errorFields)
  })
}

type OnSuccessActionsProps = {
  dispatch: AppDispatch
  candidate: string
  myAccount: string
  network: string
}

const stakeOnSuccessActions = ({ dispatch, candidate, myAccount, network }: OnSuccessActionsProps) => {
  fetchBalanceByNetwork(dispatch, [ candidate, myAccount ], network)
  dispatch(stakingDelegatorStateActions.fetchDelegatorState({ accounts: [ myAccount ], reload: true, network }))
  dispatch(stakingCandidatesInfoActions.fetchCandidatesInfo({ accounts: [ candidate ], reload: true, network }))
}

const stakeMoreOnSuccessActions = ({ dispatch, candidate, myAccount, network }: OnSuccessActionsProps) => {
  fetchBalanceByNetwork(dispatch, [ candidate, myAccount ], network)
  dispatch(stakingDelegatorStateActions.fetchDelegatorState({ accounts: [ myAccount ], reload: true, network }))
  dispatch(stakingCandidatesInfoActions.fetchCandidatesInfo({ accounts: [ candidate ], reload: true, network }))
}

const unstakeOnSuccessActions = ({ dispatch, candidate, network }: OnSuccessActionsProps) => {
  dispatch(stakingCandidatesInfoActions.fetchCandidatesInfo({ accounts: [ candidate ], reload: true, network }))
  dispatch(scheduledRequestsActions.fetchScheduledRequests({ accounts: [ candidate ], reload: true, network }))
}

const claimOnSuccessActions = ({ dispatch, candidate, myAccount, network }: OnSuccessActionsProps) => {
  stakeOnSuccessActions({ dispatch, candidate, myAccount, network })
  dispatch(scheduledRequestsActions.fetchScheduledRequests({ accounts: [ candidate ], reload: true, network }))
}

const cancelOnSuccessActions = ({ dispatch, candidate, network }: OnSuccessActionsProps) => {
  dispatch(scheduledRequestsActions.fetchScheduledRequests({ accounts: [ candidate ], reload: true, network }))
}

export const getParamsByAction = (t: TFunction) => {
  const commonUnstakeFields = {
    title: 'Unstake from',
    label: t('staking.buttons.unstake'),
    buildOnSuccessActions: unstakeOnSuccessActions,
    onSuccessMessage: t('staking.success.unstaked')
  }

  return {
    stake: {
      title: 'Stake to',
      tx: 'parachainStaking.delegate',
      label: t('staking.buttons.stake'),
      buildOnSuccessActions: stakeOnSuccessActions,
      onSuccessMessage: t('staking.success.staked')
    },
    stakeMore: {
      title: 'Stake to',
      tx: 'parachainStaking.delegatorBondMore',
      label: t('staking.buttons.stake'),
      buildOnSuccessActions: stakeMoreOnSuccessActions,
      onSuccessMessage: t('staking.success.staked')
    },
    unstake: {
      ...commonUnstakeFields,
      tx: 'parachainStaking.scheduleDelegatorBondLess',
    },
    unstakeAll: {
      ...commonUnstakeFields,
      tx: 'parachainStaking.scheduleRevokeDelegation',
    },
    claim: {
      title: '',
      tx: 'parachainStaking.executeDelegationRequest',
      label: t('staking.buttons.claim'),
      buildOnSuccessActions: claimOnSuccessActions,
      onSuccessMessage: t('staking.success.claimed')
    },
    cancel: {
      title: '',
      tx: 'parachainStaking.cancelDelegationRequest',
      label: t('staking.buttons.cancel'),
      buildOnSuccessActions: cancelOnSuccessActions,
      onSuccessMessage: t('staking.success.canceled')
    },
  }
}

type BuildTxParamsProps = {
  network: string
  stakeForm?: FormInstance
  delegator: string
  candidate: string
  decimals: number
  getApiByNetwork?: (network: string) => Promise<ApiPromise>
}

const buildStakeTxParams = async ({
  network,
  stakeForm,
  delegator,
  candidate,
  decimals,
  getApiByNetwork
}: BuildTxParamsProps) => {
  const amount = stakeForm && new BN(stakeForm.getFieldValue(fieldName('amount')))
  const api = await getApiByNetwork?.(network)

  if (!api) return []

  const delegatorState = await api.query.parachainStaking.delegatorState(delegator)
  const candidateInfo = await api.query.parachainStaking.candidateInfo(candidate)

  const delegatorStateHuman = delegatorState.toHuman() as DelegatorState
  const candidateInfoHuman = candidateInfo.toHuman() as StakingCandidate

  const delegationsCount = delegatorStateHuman?.delegations.length || 0
  const candidateDelegationsCount = candidateInfoHuman?.delegationCount || 0

  if (!candidate || !decimals || !amount || amount.eq(BIGNUMBER_ZERO)) return []

  const delegationCount = delegationsCount ? delegationsCount + 1 : 0
  const candidateDelegationCount = candidateDelegationsCount ? candidateDelegationsCount + 1 : 0

  return [
    candidate,
    getBalanceWithDecimal(amount.toString(), decimals).toString(),
    candidateDelegationCount,
    delegationCount
  ]
}

const buildStakeOrUnstakeTxParams = async ({
  stakeForm,
  candidate,
  decimals,
}: BuildTxParamsProps) => {
  const amount = stakeForm && new BN(stakeForm.getFieldValue(fieldName('amount')))

  if (!candidate || !decimals || !amount || amount.eq(BIGNUMBER_ZERO)) return []

  return [
    candidate,
    getBalanceWithDecimal(amount.toString(), decimals).toString(),
  ]
}

const buildClaimTxParams = async ({
  candidate,
  delegator,
}: BuildTxParamsProps) => {
  if (!candidate || !delegator) return []

  return [
    delegator,
    candidate
  ]
}

const buildCancelOrUnstakeAllTxParams = async ({
  candidate,
}: BuildTxParamsProps) => {
  if (!candidate) return []

  return [
    candidate
  ]
}

type TxFunc = (props: BuildTxParamsProps) => Promise<any[]>

type BuildTxPatamsByNetwork = Record<Action, TxFunc>

export const buildTxPatamsByAction: BuildTxPatamsByNetwork = {
  stake: buildStakeTxParams,
  stakeMore: buildStakeOrUnstakeTxParams,
  unstake: buildStakeOrUnstakeTxParams,
  unstakeAll: buildCancelOrUnstakeAllTxParams,
  claim: buildClaimTxParams,
  cancel: buildCancelOrUnstakeAllTxParams
}

export const useFetchStakingDataByNetwork = (network: string, candidates?: string[], myAddresses?: string[]) => {
  useFetchCandidatesInfo(network, candidates)
  useFetchSceduledRequests(network, candidates)
  useFetchStakingDelegatorsState(network, myAddresses)
  useFetchBalances()
}

export const filterStakingDataByTabKey = (tabs: StakingTab[], data?: CollatorStakingInfo[]) => {
  const dataByKey: Partial<Record<StakingTabKey, CollatorStakingInfo[]>> = {}

  tabs.forEach(({ key }) => {
    const keyValue = key as StakingTabKey

    dataByKey[keyValue] = data?.filter(x => x.candidateStatus === key)
  })

  return dataByKey
}

type TimeToExeciteProps = {
  stakingContextState: StakingContextState
  round?: Round
  whenExecutable?: number
}

export const TimeToClaim = ({ stakingContextState, round, whenExecutable }: TimeToExeciteProps) => {
  const { currentBlockNumber, blockTime, currentTimestamp } = stakingContextState

  if (!round || !currentBlockNumber) return <>-</>

  const time = getNextRoundDate({
    blockNumber: currentBlockNumber,
    blockTime,
    currentTimestamp,
    round,
    whenExecutable
  })

  const currentTime = new Date().getTime().toString()

  return <div>
    {currentBlockNumber.isZero() || new BN(currentTime).gt(time)
      ? <Skeleton paragraph={{ rows: 0 }} className={styles.TimeSkeleton} />
      : SubDate.formatDate(time.toNumber())}
  </div>
}

type FilterStakingDataProps = {
  tabKey: StakingTabKey
  showMyStake: boolean
  data?: Partial<Record<StakingTabKey, CollatorStakingInfo[]>>
}

export const filterStakingData = ({ tabKey, showMyStake, data = {} }: FilterStakingDataProps) => {
  const dataByTabKey = data[tabKey] || []

  return showMyStake ? dataByTabKey.filter(x => x.stakedValue.gt(BIGNUMBER_ZERO)) : dataByTabKey
}

type MobileStakingCardsProps = {
  data: CollatorStakingInfo[]
}

type StakingCardItemProps = {
  item: CollatorStakingInfo
  key: string
}

const StakingCardItem = ({ item, key }: StakingCardItemProps) => {
  const { total, name, actions, staked, stakers, selfStake } = item
  const [ isCollapsed, setIsCollapsed ] = useState(false)

  const onCollapseChange = (key: string | string[]) => {
    setIsCollapsed(!isEmptyArray(key))
  }

  return <Card key={key} className={styles.MobileCards}>
    <Collapse ghost expandIconPosition='right' onChange={onCollapseChange}>
      <Collapse.Panel header={
        <div className='d-flex align-items-center justify-content-between'>
          {name}
          {!isCollapsed && <div className='d-grid mr-4 text-right'>
            {selfStake}
            {total}
          </div>}
        </div>
      } key={key}>
        <div className={styles.CardItems}>
          <div className='d-flex justify-content-between mb-3'>
            <Space direction='vertical' size={4}>
              <MutedDiv>My Stake:</MutedDiv>
              <MutedDiv>Self-Stake:</MutedDiv>
              <MutedDiv>Total Staked:</MutedDiv>
              <MutedDiv>Stakers:</MutedDiv>
            </Space>
            <Space direction='vertical' size={4} className='text-right'>
              <div>{staked}</div>
              <div>{selfStake}</div>
              <div>{total}</div>
              <div>{stakers}</div>
            </Space>
          </div>
          {actions}
        </div>
      </Collapse.Panel>
    </Collapse>
  </Card>
}

type UnstakedBalanceProps = {
  network: string
  candidate: string
  address?: string
  decimals: number
  nativeSymbol: string
}

export const UnstakedBalances = ({ network, candidate, address, decimals, nativeSymbol }: UnstakedBalanceProps) => {
  const scheduledRequests = useManyScheduledRequestsByNetwork(network, [ candidate ])

  if(!address) return <Skeleton paragraph={{ rows: 0 }} className={styles.TimeSkeleton} />

  const { action } = scheduledRequests[candidate]?.requests[address] || {}

  if(!action) return <>-</>

  const decreaseValue = (action?.decrease || action?.revoke) as string

  const decreaseValueWidDecimals = getBalanceWithDecimals({ totalBalance: decreaseValue, decimals })

  return <BalanceView value={decreaseValueWidDecimals.toString()} withSymbol={false} symbol={nativeSymbol} />
}

export const MobileStakingCards = ({ data }: MobileStakingCardsProps) => {
  if (isEmptyArray(data)) return <NoData description={'No Data'} />

  return <div>
    {data.map((item, i) => <StakingCardItem item={item} key={i.toString()} />)}
  </div>
}
type MyStakeCountProps = {
  data: CollatorStakingInfo[]
}

export const MyStakeCount = ({ data }: MyStakeCountProps) => {
  const myStakeCount = data.filter(x => !x.stakedValue.isZero()).length

  return myStakeCount ? <> ({myStakeCount})</> : null
}