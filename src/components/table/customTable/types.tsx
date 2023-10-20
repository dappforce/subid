import { ColumnsType } from 'antd/lib/table'
import { BalanceKind, BalanceTableProps } from '../types'
import { RelayChain } from 'src/types'
import BigNumber from 'bignumber.js'

export type ActionsConfig = {
  title: string
  showTabs?: boolean
  refreshText: string
  checkBoxText?: string
  buttonsClassName?: string
}

export type CustomTableProps<T> = BalanceTableProps & {
  storeTableView: string
  storeShowZeroBalance: string
  maxItems?: number
  data?: T[]
  filterItem?: (item: T) => boolean
  columns: ColumnsType<any>
  loading: boolean
  setLoading: (loading: boolean) => void
  createFieldSkeletons: (data?: T[]) => T[]
  balanceKind: BalanceKind
  noData: string
  loadingLabel: string
  showZeroBalance?: boolean
  tabs?: JSX.Element
  relayChain?: RelayChain
  showAllPage: string
  onReload: () => void
  totalBalance?: BigNumber
  actionsConfig: ActionsConfig
  tableTab?: string
}

export type TableActionsProps<T> = ActionsConfig & {
  tabs?: JSX.Element
  onReload: () => void
  totalBalance?: BigNumber
  loading: boolean
  balanceKind: BalanceKind
  data?: T[]
  setSkeleton: (skeleton: T[]) => void
  createFieldSkeletons: (data?: T[]) => T[]
  filterNonZero: (x: T) => boolean
}