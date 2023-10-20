// import { isDef } from '@subsocial/utils'
// import dynamic from 'next/dynamic'
// import { useEffect, useReducer, useState } from 'react'
// import {
//   useIsMyConnectedAddress,
//   useMyExtensionAccount,
// } from '../../providers/MyExtensionAccountsContext'
// import { BalanceTableProps, BalancesTableInfo } from '../types'
// import CustomTable from '../customTable'
// import {
//   BALANCE_TABLE_VIEW,
//   BALANCE_SHOW_ZERO_BALANCES,
//   isDataLoading,
//   BALANCE_TABLE_VARIANT,
// } from '../utils'
// import { usePrices } from '../../../rtk/features/prices/pricesHooks'
// import {
//   fetchBalances,
//   useManyBalances,
// } from '../../../rtk/features/balances/balancesHooks'
// import { useAppDispatch } from '../../../rtk/app/store'
// import { useIdentitiesByAccounts } from '../../../rtk/features/identities/identitiesHooks'
// import { useResponsiveSize } from '../../responsive/ResponsiveContext'
// import { useTranslation } from 'react-i18next'
// import { BIGNUMBER_ZERO } from '../../../config/app/consts'
// import {
//   ParseBalanceTableInfoProps,
//   parseTokenCentricView,
// } from './parseTokenCentricView'
// import { parseBalancesTableInfo } from './parseBalanceInfo'
// import clsx from 'clsx'
// import store from 'store'
// import {
//   useBuildSendEvent,
// } from 'src/components/providers/AnalyticContext'

// const TransferModal = dynamic(
//   () => import('src/components/transfer/TransferModal'),
//   { ssr: false }
// )

// export const BalancesTable = (props: BalanceTableProps) => {
//   const {
//     setBalances,
//     isMulti,
//     balances: { freeChainBalances, lockedChainBalances },
//   } = useMyExtensionAccount()
//   const { isMobile } = useResponsiveSize()
//   const [ data, setData ] = useState<BalancesTableInfo[]>()
//   const [ loading, setLoading ] = useState<boolean>(false)

//   const tableVariantFromStore = store.get(BALANCE_TABLE_VARIANT)

//   const [ balancesVariant, setBalancesVariant ] = useState<BalanceVariant>(
//     tableVariantFromStore || 'chains'
//   )
//   const tokenPrices = usePrices()
//   const dispatch = useAppDispatch()
//   const {
//     t,
//     i18n: { language },
//   } = useTranslation()
//   const sendTransferEvent = useBuildSendEvent('click_on_transfer_button')

//   const [ transferModalState, transferModalDispatch ] = useReducer(
//     transferModalReducer,
//     initialTransferModalState
//   )

//   const {
//     chainsInfo,
//     addresses,
//     maxItems,
//     showZeroBalance,
//     showCheckBox,
//     showTabs,
//   } = props
//   const isMyAddress = useIsMyConnectedAddress(addresses?.[0])

//   const identities = useIdentitiesByAccounts(addresses)

//   const balancesEntities = useManyBalances(addresses)

//   const balancesLoading = isDataLoading(balancesEntities)

//   const fetchBalancesFunc = () => fetchBalances(dispatch, addresses, true)

//   useEffect(() => {
//     setLoading(!balancesEntities ? true : !!balancesLoading)
//   }, [ balancesLoading ])

//   useEffect(() => {
//     setLoading(true)
//   }, [ JSON.stringify(tokenPrices) ])

//   useEffect(() => {
//     if (!addresses || !chainsInfo) return

//     let isMounted = true

//     const info = async () => {
//       const props: ParseBalanceTableInfoProps = {
//         chainsInfo,
//         tokenPrices,
//         identities,
//         isMulti,
//         balancesEntities,
//         isMobile,
//         onTransferClick: (token, network, tokenId) => {
//           transferModalDispatch({
//             type: 'OPEN',
//             payload: { token, network, tokenId },
//           })
//           sendTransferEvent()
//         },
//         t,
//       }

//       const tableInfo: BalancesTableInfo[] =
//         balancesVariant === 'chains'
//           ? await parseBalancesTableInfo(props)
//           : await parseTokenCentricView(props)

//       if (tableInfo) {
//         setData(tableInfo.filter(isDef))

//         if (balancesLoading === false && balancesEntities) setLoading(false)
//       }

//       let freeChainBalances = BIGNUMBER_ZERO
//       let lockedChainBalances = BIGNUMBER_ZERO

//       tableInfo?.forEach((info) => {
//         const childrenBalances = info?.children

//         if (isMulti) {
//           childrenBalances?.forEach((childrenInfo) => {
//             const childrenBalancesByAccount = childrenInfo?.children

//             const { freeCalculatedBalance, lockedCalculatedBalance } =
//               calculateChildrenBalances(
//                 freeChainBalances,
//                 lockedChainBalances,
//                 childrenBalancesByAccount
//               )

//             freeChainBalances = freeCalculatedBalance
//             lockedChainBalances = lockedCalculatedBalance
//           })
//         } else {
//           if (balancesVariant === 'chains') {
//             const { freeCalculatedBalance, lockedCalculatedBalance } =
//               calculateChildrenBalances(
//                 freeChainBalances,
//                 lockedChainBalances,
//                 childrenBalances
//               )

//             freeChainBalances = freeCalculatedBalance
//             lockedChainBalances = lockedCalculatedBalance
//           } else {
//             childrenBalances?.forEach((childrenBalance) => {
//               const { freeCalculatedBalance, lockedCalculatedBalance } =
//                 calculateChildrenBalances(
//                   freeChainBalances,
//                   lockedChainBalances,
//                   childrenBalance?.children
//                 )

//               freeChainBalances = freeCalculatedBalance
//               lockedChainBalances = lockedCalculatedBalance
//             })
//           }
//         }
//       })

//       setBalances({ freeChainBalances, lockedChainBalances })
//     }

//     isMounted &&
//       info().catch((err) =>
//         console.error(
//           'Failed to load account balances from multiple chains:',
//           err
//         )
//       )
//   }, [
//     addresses?.join(','),
//     JSON.stringify(balancesEntities || {}),
//     isMulti,
//     loading,
//     language,
//     balancesVariant,
//   ])

//   return (
//     <>
//       <CustomTable
//         actionsConfig={{
//           title: t('table.balances.title'),
//           checkBoxText: showCheckBox
//             ? t('table.balances.checkBoxText')
//             : undefined,
//           showTabs,
//           refreshText: t('table.balances.refreshText'),
//           buttonsClassName: clsx('bs-mt-2 align-items-center'),
//         }}
//         maxItems={maxItems}
//         showZeroBalance={showZeroBalance}
//         showAllPage={`${addresses?.join(',') || ''}/balances`}
//         addresses={addresses}
//         balanceKind='NativeToken'
//         columns={getColumns(t, isMyAddress, balancesVariant)}
//         loading={!!loading}
//         setLoading={setLoading}
//         loadingLabel={t('table.balances.loading')}
//         noData={t('table.balances.noData')}
//         createFieldSkeletons={(data) =>
//           createFieldSkeletons(data as BalancesTableInfo[])
//         }
//         data={data}
//         chainsInfo={chainsInfo}
//         storeTableView={BALANCE_TABLE_VIEW}
//         storeShowZeroBalance={BALANCE_SHOW_ZERO_BALANCES}
//         onReload={fetchBalancesFunc}
//         totalBalance={freeChainBalances.plus(lockedChainBalances)}
//         tableTab={balancesVariant}
//         tabs={
//           <BalanceTableVariantTabs
//             balancesVariant={balancesVariant}
//             setBalancesVariant={setBalancesVariant}
//           />
//         }
//       />
//       <TransferModal
//         open={transferModalState.open}
//         onCancel={() => transferModalDispatch({ type: 'CLOSE' })}
//         defaultSelectedToken={transferModalState.defaultToken}
//       />
//     </>
//   )
// }

// export default BalancesTable
export {}