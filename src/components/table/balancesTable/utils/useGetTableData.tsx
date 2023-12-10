import { useReducer, useMemo, useState, useEffect } from 'react'
import {
  ParseBalanceTableInfoProps,
  parseTokenCentricView,
} from '../parseData/parseTokenCentricView'
import {
  defaultBalances,
  useIsMulti,
  useMyExtensionAccount,
} from 'src/components/providers/MyExtensionAccountsContext'
import { useIdentitiesByAccounts } from 'src/rtk/features/identities/identitiesHooks'
import { useManyBalances } from 'src/rtk/features/balances/balancesHooks'
import { isDataLoading } from '../../utils'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { usePricesData } from 'src/rtk/features/prices/pricesHooks'
import { TransferFormDefaultToken } from '@/components/transfer/transferContent/TransferForm'
import { useTranslation } from 'react-i18next'
import { isEmptyArray } from '@subsocial/utils'
import { BalancesTableInfo } from '../../types'
import { BalanceVariant } from '../types'
import { parseBalancesTableInfo } from '../parseData/parseBalanceInfo'
import {
  useBuildSendEvent,
  useSendEvent,
} from 'src/components/providers/AnalyticContext'
import { useResponsiveSize } from 'src/components/responsive'
import { calculateDashboardBalances } from '../calculateDashboardBalances'
import { getBalancesFromStoreByAddresses } from '.'
import BN from 'bignumber.js'

type TransferModalState = {
  open: boolean
  defaultToken?: TransferFormDefaultToken
}
type TransferModalActions =
  | { type: 'OPEN'; payload?: TransferFormDefaultToken }
  | { type: 'CLOSE' }
const initialTransferModalState: TransferModalState = { open: false }
const transferModalReducer = (
  state: TransferModalState,
  action: TransferModalActions
): TransferModalState => {
  switch (action.type) {
    case 'OPEN':
      const defaultToken = state.defaultToken
      if (
        state.open &&
        defaultToken?.token === action.payload?.token &&
        defaultToken?.network === action.payload?.network
      )
        return state
      return {
        open: true,
        defaultToken: action.payload,
      }
    case 'CLOSE':
      if (!state.open) return state
      return {
        open: false,
      }
  }
}

export const useGetTableData = (
  addresses: string[],
  balancesVariant: BalanceVariant
) => {
  const { i18n: language, t } = useTranslation()
  const isMulti = useIsMulti()
  const sendTransferEvent = useBuildSendEvent('transfer_modal_opened')
  const { isMobile } = useResponsiveSize()
  const { setBalances } = useMyExtensionAccount()
  const [ loading, setLoading ] = useState<boolean>(false)

  const [ transferModalState, transferModalDispatch ] = useReducer(
    transferModalReducer,
    initialTransferModalState
  )

  const pricesEntity = usePricesData()
  const chainsInfo = useChainInfo()
  const identities = useIdentitiesByAccounts(addresses)
  const balancesEntities = useManyBalances(addresses)
  const { setRefreshBalances } = useMyExtensionAccount()
  const sendEvent = useSendEvent()

  const { isCachedData, prices: tokenPrices } = pricesEntity?.pricesData || {}

  const balancesLoading = isDataLoading(balancesEntities)

  useEffect(() => setRefreshBalances(balancesLoading), [ balancesLoading ])

  const data = useMemo(() => {
    if (!addresses || !chainsInfo) return []
    const balancesFromStore = getBalancesFromStoreByAddresses(addresses)

    setLoading(true)

    const props: ParseBalanceTableInfoProps = {
      chainsInfo,
      tokenPrices: tokenPrices || [],
      identities,
      isMulti,
      balancesEntities: !balancesLoading ? balancesEntities : balancesFromStore,
      isMobile,
      loading: !!balancesLoading,
      onTransferClick: (token, network, tokenId) => {
        transferModalDispatch({
          type: 'OPEN',
          payload: { token, network, tokenId },
        })
        sendTransferEvent({ eventSource: 'balance_table' })
      },
      t,
    }

    const tableInfo: BalancesTableInfo[] =
      balancesVariant === 'chains'
        ? parseBalancesTableInfo(props)
        : parseTokenCentricView(props)

    if (tableInfo && !isEmptyArray(tableInfo)) {
      const data = !balancesLoading
        ? calculateDashboardBalances(tableInfo, balancesVariant, isMulti)
        : defaultBalances

      if (!balancesLoading) {
        const balanceEntityEntries = Object.entries(balancesEntities || {})
        balanceEntityEntries.forEach(([ _, balancesEntity ]) => {
          if (!balancesEntity.balances) return

          balancesEntity.balances?.forEach((balance) => {
            const { nativeToken, tokenSymbols } = chainsInfo[balance.network]

            const nativeSymbol = nativeToken || tokenSymbols[0]

            const nativeBalance = balance.info[nativeSymbol]?.totalBalance

            if (!new BN(nativeBalance).isZero()) {
              sendEvent('balances_tokens_found', {
                network: balance.network,
              })
            }
          })
        })
      }
      setBalances(data)
      setLoading(false)
    }

    return tableInfo
  }, [
    addresses?.join(','),
    JSON.stringify(balancesEntities || {}),
    balancesLoading,
    isMulti,
    isCachedData,
    language,
    balancesVariant,
  ])

  return {
    loading,
    balancesLoading,
    data,
    transferModalState,
    transferModalDispatch,
  }
}
