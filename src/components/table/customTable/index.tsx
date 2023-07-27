import { Button } from 'antd'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from '../Table.module.sass'
import { TableInfo } from '../types'
import { BalancePart } from '../utils'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { MAX_ITEMS_FOR_TABLE } from '../../homePage/OverviewSection'
import { TableContextWrapper, useTableContext } from './TableContext'
import { TableActions, TitleAndControls } from './TableActions'
import { CustomTableProps } from './types'

export const InnerCustomTable = <T extends TableInfo>(
  props: CustomTableProps<T>
) => {
  const {
    data,
    filterItem,
    maxItems,
    columns,
    addresses,
    loading,
    loadingLabel,
    setLoading,
    balanceKind,
    storeTableView,
    storeShowZeroBalance,
    noData,
    createFieldSkeletons,
    tabs,
    relayChain,
    onReload,
    showAllPage,
    totalBalance,
    actionsConfig,
  } = props
  const { t } = useTranslation()
  const { tableView, showZeroBalances } = useTableContext()
  const checkBoxText = actionsConfig.checkBoxText

  const [ skeleton, setSkeleton ] = useState<T[]>()
  const filterNonZero = (x: T) =>
    !showZeroBalances
      ? x.balanceValue.gt(0) || x.statusValue === 'Active'
      : true

  useEffect(() => {
    setLoading(true)
    setSkeleton(
      createFieldSkeletons(
        !!checkBoxText
          ? data?.filter(filterNonZero)
          : data?.slice(0, MAX_ITEMS_FOR_TABLE)
      )
    )
  }, [ addresses?.join(','), !data ])

  const isHomePage = maxItems && data && data.length > maxItems

  return (
    <div
      className={clsx({
        [styles.Table]: isHomePage,
        [styles.TableMargin]: !isHomePage,
      })}
    >
      <TitleAndControls
        tabs={tabs}
        onReload={onReload}
        totalBalance={totalBalance}
        loading={loading}
        data={data}
        balanceKind={balanceKind}
        setSkeleton={setSkeleton}
        createFieldSkeletons={createFieldSkeletons}
        filterNonZero={filterNonZero}
        {...actionsConfig}
      />

      <div className={clsx(styles.BalanceBlock)}>
        <TableActions totalBalance={totalBalance} {...actionsConfig} />

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
      </div>

      {tableView !== 'pie' && isHomePage && (
        <Link href={showAllPage}>
          <Button
            className={clsx(styles.ShowAllButton)}
            type='primary'
            block
            ghost
          >
            {t('general.showAll')}
          </Button>
        </Link>
      )}
    </div>
  )
}

const CustomTable = <T extends TableInfo>({
  storeShowZeroBalance,
  storeTableView,
  ...props
}: CustomTableProps<T>) => {
  const storeProps = { storeShowZeroBalance, storeTableView }

  return (
    <TableContextWrapper {...storeProps}>
      <InnerCustomTable {...storeProps} {...props} />
    </TableContextWrapper>
  )
}

export default CustomTable
