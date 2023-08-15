import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Checkbox, Col, Radio, Tooltip } from 'antd'
import clsx from 'clsx'
import { useResponsiveSize } from 'src/components/responsive'
import { SectionTitle } from 'src/components/utils'
import { useTableContext } from './TableContext'
import { BalanceView } from 'src/components/homePage/address-views/utils'
import { useSendGaUserEvent } from 'src/ga'
import { tailsViewOpt } from '../utils'
import { MAX_ITEMS_FOR_TABLE } from 'src/components/homePage/OverviewSection'
import { TableInfo } from '../types'
import { useMyAddresses } from 'src/components/providers/MyExtensionAccountsContext'
import { useTranslation } from 'react-i18next'
import { TableActionsProps } from './types'
import styles from '../Table.module.sass'

export const TableActions = <T extends TableInfo>({
  title,
  totalBalance,
  checkBoxText,
}: Pick<TableActionsProps<T>, 'title' | 'totalBalance' | 'checkBoxText'>) => {
  const { isMobile } = useResponsiveSize()
  const { tableView, showZeroBalances, setTableView, setShowZeroBalances } =
    useTableContext()
  const sendGaEvent = useSendGaUserEvent()
  const { t } = useTranslation()

  const onRadioTilesChange = (e: any) => {
    const newTableView = e.target.value
    sendGaEvent(`Change ${title} table view to ${newTableView}`)
    setTableView(newTableView)
  }

  const onCheckboxChange = (e: any) => {
    setShowZeroBalances(e.target.checked)
  }

  return (
    <div className={clsx(styles.TableActions)}>
      <div className='d-flex font-weight-bold'>
        <div className='bs-mr-2'>{t('general.total')}</div>
        <BalanceView value={totalBalance} symbol='$' startWithSymbol />
      </div>
      <div className={clsx('d-flex align-items-center GapSmall')}>
        {checkBoxText && (
          <Col>
            <Checkbox checked={showZeroBalances} onChange={onCheckboxChange}>
              {checkBoxText}
            </Checkbox>
          </Col>
        )}
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
      </div>
    </div>
  )
}

export const TitleAndControls = <T extends TableInfo>({
  tabs,
  showTabs,
  title,
  loading,
  refreshText,
  setSkeleton,
  createFieldSkeletons,
  checkBoxText,
  balanceKind,
  data,
  onReload,
  filterNonZero,
}: TableActionsProps<T>) => {
  const addresses = useMyAddresses()
  const { isMobile } = useResponsiveSize()

  const onReloadClick = () => {
    setSkeleton(
      createFieldSkeletons(
        !!checkBoxText
          ? data?.filter(filterNonZero)
          : data?.slice(0, MAX_ITEMS_FOR_TABLE)
      )
    )

    if (addresses) {
      onReload()
    }
  }

  const isCrowdloanTable = balanceKind === 'Crowdloan'

  return (
    <div className={clsx({ ['mx-3']: isMobile })}>
      <div className='d-flex justify-content-between align-items-center'>
        <SectionTitle title={title} className='bs-mb-0' />
        <div className={styles.TitleAndControlsRight}>
          {showTabs && !isCrowdloanTable && tabs}
          <Tooltip title={refreshText}>
            <Button onClick={onReloadClick} disabled={loading}>
              {loading ? <LoadingOutlined /> : <ReloadOutlined />}
            </Button>
          </Tooltip>
        </div>
      </div>
      {showTabs && isCrowdloanTable && tabs}
    </div>
  )
}
