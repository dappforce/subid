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
import { usePrices } from 'src/rtk/features/prices/pricesHooks'
import { TransferFormDefaultToken } from 'src/components/transfer/TransferForm'
import { useTranslation } from 'react-i18next'
import { isEmptyArray } from '@subsocial/utils'
import { BalancesTableInfo } from '../../types'
import { BalanceVariant } from '../types'
import { parseBalancesTableInfo } from '../parseData/parseBalanceInfo'
import { useBuildSendEvent } from 'src/components/providers/AnalyticContext'
import { useResponsiveSize } from 'src/components/responsive'
import { calculateDashboardBalances } from '../calculateDashboardBalances'
import { getBalancesFromStoreByAddresses } from '.'

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
  const sendTransferEvent = useBuildSendEvent('click_on_transfer_button')
  const { isMobile } = useResponsiveSize()
  const { setBalances } = useMyExtensionAccount()
  const [ loading, setLoading ] = useState<boolean>(false)

  const [ transferModalState, transferModalDispatch ] = useReducer(
    transferModalReducer,
    initialTransferModalState
  )

  const tokenPrices = usePrices()
  const chainsInfo = useChainInfo()
  const identities = useIdentitiesByAccounts(addresses)
  const balancesEntities = useManyBalances(addresses)
  const { setRefreshBalances } = useMyExtensionAccount()

  const balancesLoading = isDataLoading(balancesEntities)

  useEffect(() => setRefreshBalances(balancesLoading), [ balancesLoading ])

  const data = useMemo(() => {
    if (!addresses || !chainsInfo) return []
    const balancesFromStore = getBalancesFromStoreByAddresses(addresses)

    setLoading(true)

    const props: ParseBalanceTableInfoProps = {
      chainsInfo,
      tokenPrices,
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
        sendTransferEvent()
      },
      t,
    }

    const tableInfo: BalancesTableInfo[] =
      balancesVariant === 'chains'
        ? parseBalancesTableInfo(props)
        : parseTokenCentricView(props)

    if (tableInfo && !isEmptyArray(tableInfo)) {
      const data = !balancesLoading ? calculateDashboardBalances(
        tableInfo,
        balancesVariant,
        isMulti
      ) : defaultBalances
      setBalances(data)
      setLoading(false)
    }

    return tableInfo
  }, [
    addresses?.join(','),
    JSON.stringify(balancesEntities || {}),
    balancesLoading,
    isMulti,
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
