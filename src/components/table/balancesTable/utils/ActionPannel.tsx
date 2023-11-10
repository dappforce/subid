import { useTranslation } from 'react-i18next'
import { BalanceView } from 'src/components/homePage/address-views/utils'
import { useTableContext } from '../../customTable/TableContext'
import { useMyExtensionAccount } from 'src/components/providers/MyExtensionAccountsContext'
import { Button, Checkbox, Divider, Dropdown, Radio, Tooltip } from 'antd'
import TableDropdownButton from './TableDropdownButton'
import { BalanceVariant } from '../types'
import { balanceVariantsOpt, balanceVariantsWithIconOpt, balancesViewOpt } from '.'
import { TableView } from '../../types'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { fetchBalances } from 'src/rtk/features/balances/balancesHooks'
import { useAppDispatch } from 'src/rtk/app/store'
import styles from './Index.module.sass'
import { MutedSpan, MutedDiv } from '../../../utils/MutedText'
import { useResponsiveSize } from '@/components/responsive'
import { useSendEvent } from '@/components/providers/AnalyticContext'
import { BALANCE_TABLE_VARIANT } from '../../utils'
import store from 'store'
import SwitchIcon from '@/assets/icons/switch.svg'
import clsx from 'clsx'

type CommonProps = {
  balancesVariant: BalanceVariant
  setBalancesVariant: (value: BalanceVariant) => void
}

type ActionPannelProps = CommonProps & {
  addresses: string[]
  loading: boolean
}

const ActionPannel = ({
  addresses,
  loading,
  ...balanceVariantProps
}: ActionPannelProps) => {
  const { isMobile } = useResponsiveSize()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { showZeroBalances, setShowZeroBalances } = useTableContext()

  const {
    balances: { freeChainBalances, lockedChainBalances },
  } = useMyExtensionAccount()

  const fetchBalancesFunc = () => fetchBalances(dispatch, addresses, true)

  const totalBalance = freeChainBalances.plus(lockedChainBalances)

  const onCheckboxChange = (e: any) => {
    setShowZeroBalances(e.target.checked)
  }

  const buttons = isMobile ? (
    <MobileButtons {...balanceVariantProps} />
  ) : (
    <DesktopButtons {...balanceVariantProps} />
  )

  return (
    <div className={clsx('bs-mb-3', { ['bs-px-3']: isMobile })}>
      <div className='d-flex align-items-center justify-content-between'>
        <div
          className={'d-flex aling-items-center font-weight-bold FontNormal'}
        >
          <div className='bs-mr-2'>{t('general.total')}</div>
          <BalanceView value={totalBalance} symbol='$' startWithSymbol />
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
  return (
    <>
      <TableDropdownButton
        menu={balanceVariantsWithIconOpt}
        defaultValue={balancesVariant}
        value={balancesVariant}
        onChange={(value) => setBalancesVariant(value as BalanceVariant)}
        menuClassName={styles.MenuStyles}
      />
      <TableDropdownButton
        menu={balancesViewOpt}
        defaultValue={tableView}
        value={tableView}
        onChange={(value) => setTableView(value as TableView)}
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
  }

  const onRadioTilesChange = (e: any) => {
    const newTableView = e.target.value
    sendEvent('change_balance_table_variant', { newTableView })
    setBalancesVariant(newTableView)
    store.set(BALANCE_TABLE_VARIANT, newTableView)
  }

  return (
    <div className={styles.MobileButtonsOverlay}>
      <Checkbox checked={showZeroBalances} onChange={onCheckboxChange}>
        <MutedSpan className='FontNormal'>{t('table.balances.checkBoxText')}</MutedSpan>
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

export default ActionPannel
