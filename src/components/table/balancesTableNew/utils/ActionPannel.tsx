import { useTranslation } from 'react-i18next'
import { BalanceView } from 'src/components/homePage/address-views/utils'
import { useTableContext } from '../../customTable/TableContext'
import { useMyExtensionAccount } from 'src/components/providers/MyExtensionAccountsContext'
import { Button, Checkbox, Tooltip } from 'antd'
import TableDropdownButton from './TableDropdownButton'
import { BalanceVariant } from '../types'
import { balanceVariantsOpt, balancesViewOpt } from '.'
import { TableView } from '../../types'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { fetchBalances } from 'src/rtk/features/balances/balancesHooks'
import { useAppDispatch } from 'src/rtk/app/store'
import styles from './Index.module.sass'
import { MutedSpan } from '../../../utils/MutedText'

type ActionPannelProps = {
  balancesVariant: BalanceVariant
  setBalancesVariant: (value: BalanceVariant) => void
  addresses: string[]
  loading: boolean
}

const ActionPannel = ({
  balancesVariant,
  setBalancesVariant,
  addresses,
  loading,
}: ActionPannelProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { tableView, showZeroBalances, setTableView, setShowZeroBalances } =
    useTableContext()

  const {
    balances: { freeChainBalances, lockedChainBalances },
  } = useMyExtensionAccount()

  const fetchBalancesFunc = () => fetchBalances(dispatch, addresses, true)

  const totalBalance = freeChainBalances.plus(lockedChainBalances)

  const onCheckboxChange = (e: any) => {
    setShowZeroBalances(e.target.checked)
  }

  return (
    <div className='bs-mb-3'>
      <div className='d-flex align-items-center justify-content-between'>
        <div
          className={'d-flex aling-items-center font-weight-bold FontNormal'}
        >
          <div className='bs-mr-2'>{t('general.total')}</div>
          <BalanceView value={totalBalance} symbol='$' startWithSymbol />
        </div>
        <div className={styles.TableActionButtons}>
          <TableDropdownButton
            menu={balanceVariantsOpt}
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

      <Checkbox checked={showZeroBalances} onChange={onCheckboxChange}>
        <MutedSpan>{t('table.balances.checkBoxText')}</MutedSpan>
      </Checkbox>
    </div>
  )
}

export default ActionPannel
