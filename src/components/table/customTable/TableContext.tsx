import { createContext, useContext, useState } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import { TableView } from '../types'
import store from 'store'

export type TableContextState = {
  tableView: TableView
  setTableView: (tableView: TableView) => void
  showZeroBalances: boolean
  setShowZeroBalances: (showZeroBalances: boolean) => void
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
  const { isMobile } = useResponsiveSize()
  const { storeShowZeroBalance, storeTableView } = props

  const tableViewFromStorage = store.get(storeTableView)
  const showZeroBalancesFromStorage = store.get(storeShowZeroBalance)

  const [ tableView, setTableView ] = useState<TableView>(
    isMobile ? 'cards' : tableViewFromStorage || 'table'
  )
  const [ showZeroBalances, setShowZeroBalances ] = useState<boolean>(
    showZeroBalancesFromStorage !== undefined
      ? showZeroBalancesFromStorage
      : true
  )

  const value = {
    tableView,
    setTableView,
    showZeroBalances,
    setShowZeroBalances,
  }

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>
}

export const useTableContext = () => useContext(TableContext)
