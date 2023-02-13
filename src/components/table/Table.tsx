import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Col, Radio, Tooltip } from 'antd'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import { ColumnsType } from 'antd/lib/table'
import { useEffect, useState } from 'react'
import store from 'store'
import Link from 'next/link'
import { useResponsiveSize } from '../responsive'
import styles from './Table.module.sass'
import { BalanceTableProps, TableView, BalanceKind, TableInfo } from './types'
import { RelayChain } from '../../types/index'
import { BalancePart, tailsViewOpt } from './utils'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import BN from 'bignumber.js'
import { BalanceView } from '../homePage/address-views/utils/index'
import { MAX_ITEMS_FOR_TABLE } from '../homePage/OverviewSection'
import { MutedSpan } from '../utils/MutedText'
import { useSendGaUserEvent } from 'src/ga'
import { SectionTitle } from '../utils'

type TableProps<T> = BalanceTableProps & {
  title: string
  maxItems?: number
  showTabs?: boolean
  data?: T[]
  filterItem?: (item: T) => boolean
  columns: ColumnsType<any>
  loading: boolean
  setLoading: (loading: boolean) => void
  createFieldSkeletons: (data?: T[]) => T[]
  balanceKind: BalanceKind
  checkBoxText?: string
  refreshText: string
  noData: string
  loadingLabel: string
  showZeroBalance?: boolean
  storeTableView: string
  storeShowZeroBalance: string
  tabs?: JSX.Element
  relayChain?: RelayChain
  showAllPage: string
  onReload: () => void
  totalBalance?: BN
}

export const TableTemplate = <T extends TableInfo>(props: TableProps<T>) => {
  const {
    title,
    showTabs,
    maxItems,
    data,
    filterItem,
    columns,
    addresses,
    loading,
    loadingLabel,
    setLoading,
    balanceKind,
    checkBoxText,
    refreshText,
    noData,
    storeTableView,
    storeShowZeroBalance,
    createFieldSkeletons,
    tabs,
    relayChain,
    onReload,
    showAllPage,
    totalBalance
  } = props
  const { t } = useTranslation()
  const sendGaEvent = useSendGaUserEvent()

  const tableViewFromStorage = store.get(storeTableView)
  const showZeroBalancesFromStorage = store.get(storeShowZeroBalance)

  const { isMobile } = useResponsiveSize()
  const [ tableView, setTableView ] = useState<TableView>(isMobile ? 'cards' : tableViewFromStorage || 'table')
  const [ showZeroBalances, setShowZeroBalances ] = useState<boolean>(showZeroBalancesFromStorage !== undefined ? showZeroBalancesFromStorage : true)
  const [ skeleton, setSkeleton ] = useState<T[]>()
  const filterNonZero = (x: T) => !showZeroBalances ? x.balanceValue.gt(0) || x.statusValue === 'Active' : true

  useEffect(() => {
    setLoading(true)
    setSkeleton(createFieldSkeletons(!!checkBoxText
      ? data?.filter(filterNonZero)
      : data?.slice(0, MAX_ITEMS_FOR_TABLE)
    ))
  }, [ addresses?.join(','), !data ])

  const onRadioTilesChange = (e: any) => {
    const newTableView = e.target.value
    sendGaEvent(`Change ${title} table view to ${newTableView}`)
    setTableView(newTableView)
  }

  const onCheckboxChange = (e: any) => {
    setShowZeroBalances(e.target.checked)
  }

  const onReloadClick = () => {
    setSkeleton(createFieldSkeletons(!!checkBoxText ? data?.filter(filterNonZero) : data?.slice(0, MAX_ITEMS_FOR_TABLE)))

    if (addresses) {
      onReload()
    }
  }
  const total = totalBalance && <><MutedSpan>{t('general.total')}:</MutedSpan> <BalanceView value={totalBalance} symbol='$' startWithSymbol /></>

  const tableTitle = <div>
    <SectionTitle 
      title={title}
      className={`mb-0 ${isMobile && tabs && checkBoxText ? 'ml-3' : ''}`}
    />
    <div className={clsx({ ['ml-3']: isMobile && showTabs })}>{total}</div>
  </div>
  const isHomePage = maxItems && data && data.length > maxItems
  const showAndHaveTabs = showTabs && tabs
  let titleBarAlignment = 'align-items-end'
  if (showAndHaveTabs) {
    titleBarAlignment = isMobile ? 'align-items-start' : 'align-items-center'
  }

  return (
    <div className={clsx({ [styles.Table]: isHomePage, [styles.TableMargin]: !isHomePage })}>
      {showAndHaveTabs && tableTitle}
      <div className={clsx(
        'd-flex justify-content-between',
        isMobile && 'pr-3 pl-3',
        titleBarAlignment,
        showAndHaveTabs && isMobile && 'flex-column align-items-start',
      )}>
        <div style={{ flex: 1 }} className='mr-2'>
          {showAndHaveTabs ? tabs : tableTitle}
        </div>
        <div className={clsx('d-flex align-items-center justify-content-between GapSmall', isMobile && showAndHaveTabs && 'w-100')}>
          {checkBoxText && <Col>
            <Checkbox checked={showZeroBalances} onChange={onCheckboxChange}>
              {checkBoxText}
            </Checkbox>
          </Col>}
          {!isMobile && (
            <Col>
              <Radio.Group
                optionType='button'
                options={tailsViewOpt}
                onChange={onRadioTilesChange}
                value={tableView}
              />
            </Col>
          )}
          <Col>
            <Tooltip title={refreshText}>
              <Button onClick={onReloadClick} disabled={loading}>
                {loading
                  ? <LoadingOutlined />
                  : <ReloadOutlined />
                }
              </Button>
            </Tooltip>
          </Col>
        </div>
      </div>

      <BalancePart
        maxItems={maxItems}
        balanceKind={balanceKind}
        data={data || []}
        columns={columns}
        skeleton={skeleton}
        showCheckBox={!!checkBoxText}
        relayChain={relayChain}
        filterItem={filterItem}
        loadingLabel={loadingLabel}
        tableView={tableView}
        showZeroBalances={showZeroBalances}
        loading={loading}
        storeTableView={storeTableView}
        storeShowZeroBalance={storeShowZeroBalance}
        noData={noData}
      />

      {tableView !== 'pie' && isHomePage && (
        <Link href={showAllPage}>
          <Button className={clsx(styles.ShowAllButton)} type='primary' block ghost >{t('general.showAll')}</Button>
        </Link>)}
    </div>
  )
}

export default TableTemplate
