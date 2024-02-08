import { createContext, useContext, useEffect, useState } from 'react'
import { TableView } from '../types'
import store from 'store'
import { BalanceVariant } from './types'
import { BALANCE_TABLE_VARIANT } from '../utils'

export type TableContextState = {
  tableView: TableView
  setTableView: (tableView: TableView) => void
  showZeroBalances: boolean
  setShowZeroBalances: (showZeroBalances: boolean) => void
  balancesVariant: BalanceVariant
  setBalancesVariant: (balancesVariant: BalanceVariant) => void
}

type TableContextProps = {
  storeTableView: string
  storeShowZeroBalance: string
}

const TableContext = createContext<TableContextState>({} as any)

export const TableContextWrapper: React.FC<TableContextProps> = ({
  children,
  ...props
}) => {
  const { storeShowZeroBalance, storeTableView } = props

  const tableViewFromStorage = store.get(storeTableView)
  const showZeroBalancesFromStorage = store.get(storeShowZeroBalance)
  const tableVariantFromStore = store.get(BALANCE_TABLE_VARIANT)

  const [tableView, setTableView] = useState<TableView>(
    !tableViewFromStorage || tableViewFromStorage === 'cards'
      ? 'table'
      : tableViewFromStorage
  )
  const [showZeroBalances, setShowZeroBalances] = useState<boolean>(
    showZeroBalancesFromStorage !== undefined
      ? showZeroBalancesFromStorage
      : true
  )

  const [balancesVariant, setBalancesVariant] = useState<BalanceVariant>(
    tableVariantFromStore || 'chains'
  )

  useEffect(() => {
    if (!tableViewFromStorage || tableViewFromStorage === 'cards') {
      store.set(storeTableView, 'table')
    }
  }, [tableViewFromStorage])

  const value = {
    tableView,
    setTableView,
    showZeroBalances,
    setShowZeroBalances,
    balancesVariant,
    setBalancesVariant,
  }

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>
}

export const useTableContext = () => useContext(TableContext)
