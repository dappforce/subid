import { useTranslation } from 'react-i18next'
import { BalanceView } from 'src/components/homePage/address-views/utils'
import { useTableContext } from '../../customTable/TableContext'
import { useMyExtensionAccount } from 'src/components/providers/MyExtensionAccountsContext'
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Radio,
  Skeleton,
  Tooltip,
} from 'antd'
import { BalanceVariant } from '../types'
import {
  balanceVariantsOpt,
  balanceVariantsWithIconOpt,
  balancesViewOpt,
  getBalancesFromStoreByAddresses,
} from '.'
import { TableView } from '../../types'
import {
  InfoCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { fetchBalances } from 'src/rtk/features/balances/balancesHooks'
import { useAppDispatch } from 'src/rtk/app/store'
import styles from './Index.module.sass'
import { MutedSpan, MutedDiv } from '../../../utils/MutedText'
import { useResponsiveSize } from '@/components/responsive'
import { useSendEvent } from '@/components/providers/AnalyticContext'
import { BALANCE_TABLE_VARIANT, BALANCE_TABLE_VIEW } from '../../utils'
import store from 'store'
import SwitchIcon from '@/assets/icons/switch.svg'
import clsx from 'clsx'
import { useMemo } from 'react'
import { isDef, isEmptyArray } from '@subsocial/utils'
import TableDropdownButton from '@/components/utils/Dropdowns/Dropdown'

type CommonProps = {
  balancesVariant: BalanceVariant
  setBalancesVariant: (value: BalanceVariant) => void
}

type ActionPanelProps = CommonProps & {
  addresses: string[]
  loading: boolean
}

const ActionPanel = ({
  addresses,
  loading,
  ...balanceVariantProps
}: ActionPanelProps) => {
  const { isMobile } = useResponsiveSize()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { showZeroBalances, setShowZeroBalances } = useTableContext()
  const sendEvent = useSendEvent()

  const balancesFromStore = getBalancesFromStoreByAddresses(addresses)

  const {
    balances: { freeChainBalances, lockedChainBalances },
  } = useMyExtensionAccount()

  const fetchBalancesFunc = () => {
    fetchBalances(dispatch, addresses, true)
    sendEvent('balances_reload')
  }

  const totalBalanceBN = freeChainBalances.plus(lockedChainBalances)

  const onCheckboxChange = (e: any) => {
    setShowZeroBalances(e.target.checked)
    sendEvent('balances_zero_balances_toggled', { value: e.target.checked })
  }

  const buttons = isMobile ? (
    <MobileButtons {...balanceVariantProps} />
  ) : (
    <DesktopButtons {...balanceVariantProps} />
  )

  const showInfoIcon = useMemo(() => {
    const balances = Object.values(balancesFromStore || {}).map(
      (items) => items?.balances
    )

    return !isEmptyArray(balances.filter(isDef))
  }, [ JSON.stringify(balancesFromStore || {}) ])

  const totalBalance = loading ? (
    <Tooltip
      title={
        showInfoIcon
          ? 'Balance data is being refreshed, the currently displayed balances may be incorrect'
          : ''
      }
    >
      <div className='d-flex align-items-center'>
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 1, className: styles.SkeletonParagraph }}
          className={styles.Skeleton}
        />
        {showInfoIcon && <InfoCircleOutlined className={styles.WarningIcon} />}
      </div>
    </Tooltip>
  ) : (
    <BalanceView value={totalBalanceBN} symbol='$' startWithSymbol />
  )

  return (
    <div
      className={clsx(styles.ActionPanel, 'bs-mb-3', { ['bs-px-3']: isMobile })}
    >
      <div className='d-flex align-items-center justify-content-between'>
        <div className={styles.TotalBalance}>
          <div className={styles.TotalBalanceLabel}>{t('general.total')}</div>
          {totalBalance}
        </div>
        <div className={styles.TableActionButtons}>
          {buttons}
          <Tooltip title={t('table.balances.refreshText')}>
            <Button
              onClick={fetchBalancesFunc}
              disabled={loading}
              shape='circle'
            >
              {loading ? <LoadingOutlined /> : <ReloadOutlined />}
            </Button>
          </Tooltip>
        </div>
      </div>

      {!isMobile && (
        <Checkbox checked={showZeroBalances} onChange={onCheckboxChange}>
          <MutedSpan>{t('table.balances.checkBoxText')}</MutedSpan>
        </Checkbox>
      )}
    </div>
  )
}

const DesktopButtons = ({
  balancesVariant,
  setBalancesVariant,
}: CommonProps) => {
  const { tableView, setTableView } = useTableContext()
  const sendEvent = useSendEvent()

  const onBalanceVariantChange = (value: string) => {
    setBalancesVariant(value as BalanceVariant)
    sendEvent('balances_grouping_mode_changed', { value })
    store.set(BALANCE_TABLE_VARIANT, value)
  }

  const onTableViewChange = (value: string) => {
    setTableView(value as TableView)
    sendEvent('balances_view_changed', { value })
    store.set(BALANCE_TABLE_VIEW, value)
  }

  return (
    <>
      <TableDropdownButton
        menu={balanceVariantsWithIconOpt}
        defaultValue={balancesVariant}
        value={balancesVariant}
        onChange={onBalanceVariantChange}
        menuClassName={styles.MenuStyles}
      />
      <TableDropdownButton
        menu={balancesViewOpt}
        defaultValue={tableView}
        value={tableView}
        onChange={onTableViewChange}
        menuClassName={styles.MenuStyles}
      />
    </>
  )
}

const MobileButtons = (props: CommonProps) => {
  return (
    <Dropdown
      overlay={<DrowdownOverlay {...props} />}
      placement='bottomLeft'
      trigger={[ 'click' ]}
    >
      <Button shape='circle'>
        <SwitchIcon />
      </Button>
    </Dropdown>
  )
}

const DrowdownOverlay = ({
  balancesVariant,
  setBalancesVariant,
}: CommonProps) => {
  const { t } = useTranslation()
  const { showZeroBalances, setShowZeroBalances } = useTableContext()
  const sendEvent = useSendEvent()

  const onCheckboxChange = (e: any) => {
    setShowZeroBalances(e.target.checked)
    sendEvent('balances_zero_balances_toggled', { value: e.target.checked })
  }

  const onRadioTilesChange = (e: any) => {
    const newTableVariant = e.target.value
    sendEvent('balances_grouping_mode_changed', { value: newTableVariant })
    setBalancesVariant(newTableVariant)
    store.set(BALANCE_TABLE_VARIANT, newTableVariant)
  }

  return (
    <div className={styles.MobileButtonsOverlay}>
      <Checkbox checked={showZeroBalances} onChange={onCheckboxChange}>
        <MutedSpan className='FontNormal'>
          {t('table.balances.checkBoxText')}
        </MutedSpan>
      </Checkbox>
      <Divider className={styles.DropdownDivider} />
      <div className='w-100'>
        <MutedDiv>Mode:</MutedDiv>
        <Radio.Group
          optionType='button'
          options={balanceVariantsOpt}
          onChange={onRadioTilesChange}
          value={balancesVariant}
          className={styles.BalanceVariantRadioGroup}
        />
      </div>
    </div>
  )
}

export default ActionPanel
