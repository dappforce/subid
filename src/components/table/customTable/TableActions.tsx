import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Checkbox, Col, Radio, Tooltip } from 'antd'
import clsx from 'clsx'
import { useResponsiveSize } from 'src/components/responsive'
import { SectionTitle } from 'src/components/utils'
import { useTableContext } from './TableContext'
import { MutedSpan } from 'src/components/utils/MutedText'
import { BalanceView } from 'src/components/homePage/address-views/utils'
import { useSendGaUserEvent } from 'src/ga'
import { tailsViewOpt } from '../utils'
import { MAX_ITEMS_FOR_TABLE } from 'src/components/homePage/OverviewSection'
import { TableInfo } from '../types'
import { useMyAddresses } from 'src/components/providers/MyExtensionAccountsContext'
import { useTranslation } from 'react-i18next'
import { TableActionsProps } from './types'

const TableActions = <T extends TableInfo>({
  title,
  showTabs,
  refreshText,
  tabs,
  onReload,
  totalBalance,
  loading,
  data,
  checkBoxText,
  setSkeleton,
  createFieldSkeletons,
  filterNonZero,
  buttonsClassName
}: TableActionsProps<T>) => {
  const { isMobile } = useResponsiveSize()
  const addresses = useMyAddresses()
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

  const tableTitle = (
    <div className='d-flex'>
      <SectionTitle
        title={title}
        className={`mb-0 ${isMobile && tabs && checkBoxText ? 'ml-3' : 'mr-3'}`}
      />
      <div className={clsx({ ['ml-3']: isMobile && showTabs })}>
        <MutedSpan>{t('general.total')}:</MutedSpan>{' '}
        <BalanceView value={totalBalance} symbol='$' startWithSymbol />
      </div>
    </div>
  )

  const showAndHaveTabs = showTabs && tabs

  return (
    <>
      {showAndHaveTabs && tableTitle}
      <div
        className={clsx(
          'd-flex justify-content-between',
          isMobile && 'pr-3 pl-3',
          buttonsClassName,
          showAndHaveTabs && isMobile && 'flex-column align-items-start'
        )}
      >
        <div style={{ flex: 1 }} className='mr-2'>
          {showAndHaveTabs ? tabs : tableTitle}
        </div>
        <div
          className={clsx(
            'd-flex align-items-center justify-content-between GapSmall',
            isMobile && showAndHaveTabs && 'w-100'
          )}
        >
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
          <Col>
            <Tooltip title={refreshText}>
              <Button onClick={onReloadClick} disabled={loading}>
                {loading ? <LoadingOutlined /> : <ReloadOutlined />}
              </Button>
            </Tooltip>
          </Col>
        </div>
      </div>
    </>
  )
}

export default TableActions
