import clsx from 'clsx'
import styles from '../Table.module.sass'
import {
  BALANCE_SHOW_ZERO_BALANCES,
  BALANCE_TABLE_VARIANT,
  BALANCE_TABLE_VIEW,
  BalancePart,
} from '../utils'
import { getBalanceTableColumns } from './columns'
import {
  TableContextWrapper,
  useTableContext,
} from '../customTable/TableContext'
import { useTranslation } from 'react-i18next'
import { useIsMyConnectedAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { useState } from 'react'
import { BalanceVariant } from './types'
import store from 'store'
import { useGetTableData } from './utils/useGetTableData'
import ActionPannel from './utils/ActionPannel'
import TransferModal from 'src/components/transfer/TransferModal'

type BalancesTableProps = {
  addresses: string[]
}

type BalancesTableInnerProps = BalancesTableProps & {
  storeShowZeroBalance: string
  storeTableView: string
}

const BalancesTableNewInner = (props: BalancesTableInnerProps) => {
  const { storeShowZeroBalance, storeTableView, addresses } = props
  const isMyAddress = useIsMyConnectedAddress(addresses?.[0])
  const tableVariantFromStore = store.get(BALANCE_TABLE_VARIANT)
  const { tableView, showZeroBalances } = useTableContext()

  const [ balancesVariant, setBalancesVariant ] = useState<BalanceVariant>(
    tableVariantFromStore || 'chains'
  )

  const { loading, balancesLoading, data, transferModalState, transferModalDispatch } =
    useGetTableData(addresses, balancesVariant)

  const { t } = useTranslation()

  return (
    <div className={clsx(styles.BalanceBlock, 'mt-0')}>
      <ActionPannel
        balancesVariant={balancesVariant}
        setBalancesVariant={setBalancesVariant}
        loading={!!balancesLoading}
        addresses={addresses}
      />

      <BalancePart
        balanceKind={'NativeToken'}
        loadingLabel={t('table.balances.loading')}
        columns={getBalanceTableColumns(t, isMyAddress, balancesVariant)}
        noData={t('table.balances.noData')}
        storeTableView={storeTableView}
        storeShowZeroBalance={storeShowZeroBalance}
        tableView={tableView}
        tableTab={balancesVariant}
        showZeroBalances={showZeroBalances}
        loading={loading}
        data={data || []}
        skeleton={[]}
        showCheckBox
      />
      <TransferModal
        visible={transferModalState.open}
        onCancel={() => transferModalDispatch({ type: 'CLOSE' })}
        defaultSelectedToken={transferModalState.defaultToken}
      />
    </div>
  )
}

const BalancesTableNew = (props: BalancesTableProps) => {
  const storeProps = {
    storeShowZeroBalance: BALANCE_SHOW_ZERO_BALANCES,
    storeTableView: BALANCE_TABLE_VIEW,
  }

  return (
    <TableContextWrapper {...storeProps}>
      <BalancesTableNewInner {...storeProps} {...props} />
    </TableContextWrapper>
  )
}

export default BalancesTableNew
