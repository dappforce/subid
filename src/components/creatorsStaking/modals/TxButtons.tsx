import LazyTxButton from 'src/components/lazy-connection/LazyTxButton'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import Button from '../tailwind-components/Button'
import { getBalanceWithDecimal } from 'src/components/common/balances'
import {
  fetchBalanceByNetwork,
  useBalancesByNetwork,
} from 'src/rtk/features/balances/balancesHooks'
import { getTransferableBalance } from 'src/utils/balance'
import { BN_ZERO } from '@polkadot/util'
import {
  fetchBackerInfo,
  useBackerInfoBySpaces,
  useFetchBackerInfoBySpaces,
} from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import BN from 'bn.js'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchEraStakes } from 'src/rtk/features/creatorStaking/eraStake/eraStakeHooks'
import {
  fetchGeneralEraInfo,
  useGeneralEraInfo,
} from 'src/rtk/features/creatorStaking/generalEraInfo/generalEraInfoHooks'
import {
  fetchBackerLedger,
  useBackerLedger,
} from 'src/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'
import { StakingModalVariant } from './StakeModal'
import { showParsedErrorMessage } from 'src/components/utils'
import { useSendEvent } from '@/components/providers/AnalyticContext'
import getAmountRange from '../utils/getAmountRangeForAnalytics'
import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import { useGetMyCreatorsIds } from '../hooks/useGetMyCreators'
import { useCreatorsList } from '@/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { useLazyConnectionsContext } from '@/components/lazy-connection/LazyConnectionContext'
import { useStakingConsts } from '@/rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import { ACTIVE_STAKING_SPACE_ID } from '../utils/consts'

export type CommonTxButtonProps = {
  amount?: string
  spaceId: string
  decimal: number
  label: string
  tokenSymbol: string
  closeModal: () => void
  modalVariant?: StakingModalVariant
  inputError?: string
  disabled?: boolean
  eventSource?: string
  onClick?: () => void
}

type StakingTxButtonProps = CommonTxButtonProps & {
  tx: string
}

function StakingTxButton ({
  amount,
  spaceId,
  decimal,
  label,
  disabled,
  tx,
  closeModal,
  onClick,
  inputError,
}: StakingTxButtonProps) {
  const myAddress = useMyAddress()
  const dispatch = useAppDispatch()
  const eraInfo = useGeneralEraInfo()

  const onSuccess = () => {
    fetchBalanceByNetwork(dispatch, [ myAddress || '' ], 'subsocial')
    fetchBackerInfo(dispatch, [ spaceId ], myAddress || '')
    fetchGeneralEraInfo(dispatch)
    fetchEraStakes(dispatch, [ spaceId ], eraInfo?.info?.currentEra || '0')

    fetchEraStakes(dispatch, [ spaceId ], eraInfo?.info?.currentEra || '0')

    fetchBackerLedger(dispatch, myAddress || '')

    closeModal()
  }

  const buildParams = () => {
    const amountWithDecimals = getBalanceWithDecimal(amount || '0', decimal)

    return [ spaceId, amountWithDecimals.toString() ]
  }

  const Component: React.FunctionComponent<{ onClick?: () => void }> = (
    compProps
  ) => (
    <Button
      {...compProps}
      variant={'primary'}
      size={'lg'}
      className='w-full text-base'
    >
      {label}
    </Button>
  )

  const disableButton =
    !myAddress ||
    !amount ||
    (amount && new BN(amount).lte(new BN(0))) ||
    !!inputError ||
    disabled

  return (
    <LazyTxButton
      network='subsocial'
      accountId={myAddress}
      tx={tx}
      disabled={disableButton}
      component={Component}
      onClick={onClick}
      params={buildParams}
      onFailed={showParsedErrorMessage}
      onSuccess={onSuccess}
    />
  )
}

export function StakeOrIncreaseTxButton (props: CommonTxButtonProps) {
  const myAddress = useMyAddress()
  const sendEvent = useSendEvent()
  const { decimal } = useGetChainDataByNetwork('subsocial')

  const { currencyBalance: balancesByCurrency } = useBalancesByNetwork({
    address: myAddress,
    network: 'subsocial',
    currency: props.tokenSymbol,
  })

  const availableBalance = balancesByCurrency
    ? getTransferableBalance(balancesByCurrency)
    : BN_ZERO

  return (
    <StakingTxButton
      {...props}
      onClick={() =>
        sendEvent('cs_stake_increase', {
          amountRange: getAmountRange(decimal, props.amount),
          eventSource: props.eventSource,
        })
      }
      disabled={availableBalance.isZero() || props.disabled}
      tx='creatorStaking.stake'
    />
  )
}

export function UnstakeTxButton (props: CommonTxButtonProps) {
  const { amount, label, inputError, disabled, closeModal } = props

  const myAddress = useMyAddress()
  const creatorsList = useCreatorsList()
  const { decimal } = useGetChainDataByNetwork('subsocial')
  const { getApiByNetwork } = useLazyConnectionsContext()
  const dispatch = useAppDispatch()
  const stakingConsts = useStakingConsts()

  const backerLedger = useBackerLedger(myAddress)
  const { ledger } = backerLedger || {}

  const { locked: myTotalLock } = ledger || {}
  const { minimumStakingAmount } = stakingConsts || {}

  const spaceIds = creatorsList?.map((item) => item.creator.spaceId)
  useFetchBackerInfoBySpaces(spaceIds, myAddress)

  const myCreatorsIds = useGetMyCreatorsIds(spaceIds)

  const creatorsSpaceIds =
    myCreatorsIds?.filter((id) => id !== ACTIVE_STAKING_SPACE_ID) || []

  const isOnlyActiveStaking = isEmptyArray(creatorsSpaceIds)

  const backerInfoBySpaces = useBackerInfoBySpaces(creatorsSpaceIds, myAddress)

  const sendEvent = useSendEvent()

  const onSuccess = () => {
    fetchBalanceByNetwork(dispatch, [ myAddress || '' ], 'subsocial')
    fetchBackerInfo(dispatch, spaceIds || [], myAddress || '')
    fetchGeneralEraInfo(dispatch)

    fetchBackerLedger(dispatch, myAddress || '')
    closeModal()
  }

  const buildUnstakingParams = () => {
    const amountWithDecimals = getBalanceWithDecimal(amount || '0', decimal)

    return [ ACTIVE_STAKING_SPACE_ID, amountWithDecimals.toString() ]
  }

  const buildBatchParams = async () => {
    if (!backerInfoBySpaces || !myTotalLock || !minimumStakingAmount) return []

    const api = await getApiByNetwork('subsocial')
    const amountWithDecimals = getBalanceWithDecimal(amount || '0', decimal)

    const spaceIds =
      myCreatorsIds?.filter((id) => id !== ACTIVE_STAKING_SPACE_ID) || []

    const txs = spaceIds.map((spaceId) => {
      const { totalStaked } = backerInfoBySpaces[spaceId] || {}

      if (myTotalLock <= minimumStakingAmount) {
        return api.tx.creatorStaking.unstake(
          spaceId,
          amountWithDecimals.toString()
        )
      } else {
        return api.tx.creatorStaking.moveStake(
          spaceId,
          ACTIVE_STAKING_SPACE_ID,
          totalStaked
        )
      }
    })

    const unstakingTx =
      myTotalLock <= minimumStakingAmount
        ? undefined
        : api.tx.creatorStaking.unstake(
            ACTIVE_STAKING_SPACE_ID,
            amountWithDecimals.toString()
          )

    const batchTsx = [ ...txs, unstakingTx ].filter(isDef)

    return [ batchTsx ]
  }

  const tx = isOnlyActiveStaking ? 'creatorStaking.unstake' : 'utility.batch'
  const buildParams = isOnlyActiveStaking
    ? buildUnstakingParams
    : buildBatchParams

  const Component: React.FunctionComponent<{ onClick?: () => void }> = (
    compProps
  ) => (
    <Button
      {...compProps}
      variant={'primary'}
      size={'lg'}
      className='w-full text-base'
    >
      {label}
    </Button>
  )

  const disableButton =
    !myAddress ||
    !amount ||
    (amount && new BN(amount).lte(new BN(0))) ||
    !!inputError ||
    disabled

  return (
    <LazyTxButton
      network='subsocial'
      accountId={myAddress}
      tx={tx}
      disabled={disableButton}
      component={Component}
      onClick={() => {
        sendEvent('cs_stake_decrease', {
          amountRange: getAmountRange(decimal, props.amount),
          eventSource: props.eventSource,
        })
      }}
      params={buildParams}
      onFailed={showParsedErrorMessage}
      onSuccess={onSuccess}
    />
  )
}
