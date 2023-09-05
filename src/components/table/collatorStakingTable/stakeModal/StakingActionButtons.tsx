import { Button, FormInstance, ButtonProps, Tooltip } from 'antd'
import { useState } from 'react'
import { useAppDispatch } from '../../../../rtk/app/store'
import { buildTxPatamsByAction, TimeToClaim, getParamsByAction, UnstakedBalances } from '../utils'
import { showSuccessMessage } from '../../../utils/Message'
import { ChainInfo } from '../../../../rtk/features/multiChainInfo/types'
import { useLazyConnectionsContext } from '../../../lazy-connection/LazyConnectionContext'
import { log, toGenericAccountId } from '../../../../rtk/app/util'
import { useStakingDelegatorStateByNetwork } from '../../../../rtk/features/stakingDelegators/stakingDelegatorHooks'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import { useManyScheduledRequestsByNetwork } from '../../../../rtk/features/stakingCandidates/stakingCandidatesHooks'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useStakingRoundByNetwork } from '../../../../rtk/features/stakingRound/stakingRoundHooks'
import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import StakingModal from './StakeModal'
import { useResponsiveSize } from '../../../responsive/ResponsiveContext'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { InfoCircleOutlined } from '@ant-design/icons'
import { getDecimalsAndSymbol } from '../../utils'
import styles from '../StakingTable.module.sass'
import { ApiPromise } from '@polkadot/api'
import { useStakingContext } from '../../../staking/collators/StakingContext'
import { useBuildSendEvent, useSendEvent } from 'src/components/providers/AnalyticContext'
import { useCallback } from 'hoist-non-react-statics/node_modules/@types/react'

type ActionButtonProps = {
  address: string
  network: string
}

export type Action = 'stake' | 'stakeMore' | 'unstake' | 'claim' | 'cancel' | 'unstakeAll'

export const ActionButtons = ({ address, network }: ActionButtonProps) => {
  const { isMobile } = useResponsiveSize()
  const [ open, setOpen ] = useState(false)
  const [ action, setAction ] = useState<Action>('stake')
  const myAddress = useMyAddress()
  const { t } = useTranslation()
  const { getApiByNetwork, isConnecting } = useLazyConnectionsContext()

  const sendEvent = useSendEvent()

  const myGenericAddress = toGenericAccountId(myAddress)
  const genericCandidateAddress = toGenericAccountId(address)

  const delegator = useStakingDelegatorStateByNetwork(network, myGenericAddress)
  const scheduledRequests = useManyScheduledRequestsByNetwork(network, [ address ])

  const scheduledRequestsByAccount = scheduledRequests[address]?.requests

  const actionsByAccounts = scheduledRequestsByAccount?.[myGenericAddress]?.action

  const hasRequest = myAddress
    ? !!actionsByAccounts?.decrease || !!actionsByAccounts?.revoke
    : false

  const delegations = delegator?.state?.delegations

  const isDelegated = !!delegations?.find(x => toGenericAccountId(x.owner) === genericCandidateAddress)

  const onActionButtonClick = (action: Action) => {
    setAction(action)
    setOpen(true)
    sendEvent('click_on_staking_action_button', { action })
  }

  const commonButtonProps: ButtonProps = {
    type: 'primary',
    size: isMobile ? 'middle' : 'small',
    block: isMobile ? true : false,
    disabled: isConnecting
  }
  return <>
    {isDelegated
      ? <div className={clsx('d-flex align-items-center justify-content-end')}>
        {hasRequest
          ? <ClaimOrCancelActionButton
            {...commonButtonProps}
            network={network}
            candidate={address}
            getApiByNetwork={getApiByNetwork}
            hide={() => setOpen(false)}
          />
          : <Button
            {...commonButtonProps}
            type='default'
            onClick={() => onActionButtonClick('unstake')}
          >
            {t('staking.buttons.unstake')}
          </Button>}
        <Button
          {...commonButtonProps}
          ghost
          className='ml-2'
          onClick={() => onActionButtonClick('stakeMore')}
        >
          {t('staking.buttons.stake')}
        </Button>
      </div>
      : <StakeButton
        onClick={() => onActionButtonClick('stake')}
        buttonProps={commonButtonProps}
        network={network}
        isConnecting={isConnecting}
        deligationsLength={delegations?.length || 0}
      />}

    <StakingModal open={open} hide={() => setOpen(false)} address={address} network={network} action={action} />
  </>
}

type DelegateButtonProps = {
  onClick: () => void
  buttonProps: ButtonProps
  network: string
  deligationsLength: number
  isConnecting: boolean
}

const StakeButton = ({ onClick, buttonProps, network, deligationsLength, isConnecting }: DelegateButtonProps) => {
  const chainsInfo = useChainInfo()
  const { t } = useTranslation()

  const { staking } = chainsInfo[network] || {}

  const maxDelegationPerDelegator = staking?.maxDelegationsPerDelegator

  const isToManyDelegation = deligationsLength >= maxDelegationPerDelegator || isConnecting

  const button = <div>
    <Button
      {...buttonProps}
      ghost
      disabled={isToManyDelegation}
      onClick={onClick}
    >
      {t('staking.buttons.stake')}
    </Button>
  </div>

  return isToManyDelegation ? <Tooltip title={t('staking.tooltips.tooManyDelegations')}>
    {button}
  </Tooltip> : button
}

type ClaimDelegationButtonProps = ButtonProps & {
  network: string
  candidate: string
  hide: () => void
  getApiByNetwork: (network: string) => Promise<ApiPromise>
}

const ClaimOrCancelActionButton = ({
  network,
  candidate,
  hide,
  getApiByNetwork,
  ...buttonProps
}: ClaimDelegationButtonProps) => {
  const address = useMyAddress()
  const chainsInfo = useChainInfo()
  const { t } = useTranslation()

  const stakingContextState = useStakingContext()
  const round = useStakingRoundByNetwork(network)
  const scheduledRequests = useManyScheduledRequestsByNetwork(network, [ candidate ])

  if (!address || !round) return null

  const chainInfo = chainsInfo[network]
  const { tokenSymbols, nativeToken } = chainInfo

  const nativeSymbol = nativeToken || tokenSymbols[0]

  const { decimal } = getDecimalsAndSymbol(chainInfo, nativeSymbol)

  const { whenExecutable } = scheduledRequests[candidate]?.requests[address] || {}

  const chainInfoByNetwork = chainsInfo[network]
  const currentRound = round?.current

  const claimButton =
    <ActionTxButton
      getApiByNetwork={getApiByNetwork}
      candidate={candidate}
      delegator={address}
      network={network}
      chainInfo={chainInfoByNetwork}
      hide={hide}
      action={currentRound < whenExecutable ? 'cancel' : 'claim'}
      {...buttonProps}
      type={currentRound < whenExecutable ? 'default' : 'primary'}
    />

  const tooltipTitle = currentRound < whenExecutable ? <>
    <UnstakedBalances
      network={network}
      candidate={candidate}
      address={address}
      nativeSymbol={nativeSymbol}
      decimals={decimal}
    /> {t('staking.tooltips.claimed')} <TimeToClaim
      stakingContextState={stakingContextState}
      round={round}
      whenExecutable={whenExecutable}
    />
  </> : t('staking.tooltips.readyToClaim')

  return <div className='d-flex align-items-center'>
    <Tooltip className='mr-2' title={tooltipTitle}>
      <InfoCircleOutlined className={styles.InfoCircle} />
    </Tooltip>
    {claimButton}
  </div>
}

type TransferButtonProps = ButtonProps & {
  stakeForm?: FormInstance
  candidate: string
  network: string
  delegator: string
  amount?: string
  chainInfo: ChainInfo
  hide: () => void
  action: Action
  unstakeAll?: boolean
  getApiByNetwork: (network: string) => Promise<ApiPromise>
}

export const ActionTxButton = ({
  stakeForm,
  candidate,
  network,
  delegator,
  amount,
  chainInfo,
  getApiByNetwork,
  hide,
  action,
  disabled = false,
  type = 'primary',
  size = 'large',
  block = true,
  ghost = false
}: TransferButtonProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { tx, label, buildOnSuccessActions, onSuccessMessage } = getParamsByAction(t)[action]
  const sendStakingEvent = useBuildSendEvent('click_on_staking_modal_action_button')
  const sendStakingEventTx = useCallback(() =>
    sendStakingEvent({ action }),
    [ action, sendStakingEvent ]
  )

  const decimals = chainInfo?.tokenDecimals[0]

  const buildTxParamsFunc = buildTxPatamsByAction[action]

  const buildTxParams = () => buildTxParamsFunc({ delegator, candidate, getApiByNetwork, stakeForm, decimals, network })

  const onSuccessActions = () => buildOnSuccessActions({ dispatch, candidate, myAccount: delegator, network })

  const onSuccess = () => {
    if (!delegator) return

    onSuccessActions()

    showSuccessMessage(onSuccessMessage)
    hide()
  }

  const onFailed = () => {
    log.error('Extrinsic failed')
  }

  return <LazyTxButton
    accountId={delegator}
    tx={tx}
    network={network!}
    disabled={!network || !delegator || (action !== 'claim' && action !== 'cancel' && !amount) || disabled}
    params={buildTxParams}
    onSuccess={onSuccess}
    onFailed={onFailed}
    label={label}
    type={type}
    size={size}
    block={block}
    ghost={ghost}
    onClick={sendStakingEventTx}
  />
}