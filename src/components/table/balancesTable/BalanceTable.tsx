import { InfoCircleOutlined } from '@ant-design/icons'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { Radio, Tooltip } from 'antd'
import dynamic from 'next/dynamic'
import { ColumnsType } from 'antd/lib/table'
import { useEffect, useReducer, useState } from 'react'
import { ExternalLink } from '../../identity/utils'
import {
  useIsMyConnectedAddress,
  useMyExtensionAccount,
} from '../../providers/MyExtensionAccountsContext'
import { BalanceTableProps, BalancesTableInfo } from '../types'
import CustomTable from '../customTable'
import {
  BALANCE_TABLE_VIEW,
  BALANCE_SHOW_ZERO_BALANCES,
  fieldSkeleton,
  isDataLoading,
  BALANCE_TABLE_VARIANT,
} from '../utils'
import styles from '../Table.module.sass'
import { usePrices } from '../../../rtk/features/prices/pricesHooks'
import {
  fetchBalances,
  useManyBalances,
} from '../../../rtk/features/balances/balancesHooks'
import { useAppDispatch } from '../../../rtk/app/store'
import { useIdentitiesByAccounts } from '../../../rtk/features/identities/identitiesHooks'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { TransferFormDefaultToken } from 'src/components/transfer/TransferForm'
import { BIGNUMBER_ZERO } from '../../../config/app/consts'
import {
  ParseBalanceTableInfoProps,
  parseTokenCentricView,
} from './parseTokenCentricView'
import { parseBalancesTableInfo } from './parseBalanceInfo'
import clsx from 'clsx'
import { BalanceVariant } from '../customTable/types'
import BN from 'bignumber.js'
import store from 'store'
import {
  useBuildSendEvent,
  useSendEvent,
} from 'src/components/providers/AnalyticContext'

const TransferModal = dynamic(
  () => import('src/components/transfer/TransferModal'),
  { ssr: false }
)

export const balanceVariantsOpt = [
  { label: 'Chains', value: 'chains' },
  { label: 'Tokens', value: 'tokens' },
]

type BalanceTableVariantTabsProps = {
  balancesVariant: BalanceVariant
  setBalancesVariant: (variant: BalanceVariant) => void
}

const BalanceTableVariantTabs = ({
  balancesVariant,
  setBalancesVariant,
}: BalanceTableVariantTabsProps) => {
  const sendEvent = useSendEvent()

  const onRadioTilesChange = (e: any) => {
    const newTableView = e.target.value
    sendEvent('change_balance_table_variant', { newTableView })
    setBalancesVariant(newTableView)
    store.set(BALANCE_TABLE_VARIANT, newTableView)
  }

  return (
    <Radio.Group
      optionType='button'
      options={balanceVariantsOpt}
      onChange={onRadioTilesChange}
      value={balancesVariant}
    />
  )
}

const calculateChildrenBalances = (
  freeChainBalances: BN,
  lockedChainBalances: BN,
  childrenBalance?: Partial<BalancesTableInfo>[]
) => {
  const { freeBalance, lockedBalance } =
    getFreeAndLockedBalanceFromChildren(childrenBalance)

  return {
    freeCalculatedBalance: freeChainBalances.plus(freeBalance),
    lockedCalculatedBalance: lockedChainBalances.plus(lockedBalance),
  }
}

export const createFieldSkeletons = (data?: BalancesTableInfo[]) => {
  if (!data) return []

  return data.map((item) => {
    item.balanceWithoutChildren = fieldSkeleton
    item.balance = fieldSkeleton
    item.price = fieldSkeleton
    item.total = fieldSkeleton

    if (item.children && !isEmptyArray(item.children)) {
      item.children = item.children.map((child) => {
        child.balance = fieldSkeleton
        child.total = fieldSkeleton
        child.price = fieldSkeleton

        return child
      })
    }

    return item
  })
}

const getColumns = (
  t: TFunction,
  isMyAddress: boolean,
  balancesVariant: BalanceVariant
): ColumnsType<any> => {
  const transferColumn: ColumnsType<any> = isMyAddress
    ? [ { dataIndex: 'transferAction', align: 'right' } ]
    : []
  return [
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          {balancesVariant === 'chains'
            ? t('table.labels.chain')
            : t('table.labels.token')}
        </h3>
      ),
      dataIndex: 'chain',
      className: styles.BalanceChainColumn,
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall bs-mr-4'>
          {t('table.labels.balance')}
        </h3>
      ),
      dataIndex: 'balance',
      align: 'right',
      className: styles.BalanceColumn,
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall d-flex align-items-center justify-content-end'>
          {t('table.labels.price')}
          <Tooltip
            className='ml-2'
            title={
              <div>
                {t('tooltip.informationFrom')}{' '}
                <ExternalLink
                  url='https://www.coingecko.com'
                  value='CoinGecko'
                />
              </div>
            }
          >
            <InfoCircleOutlined />
          </Tooltip>
        </h3>
      ),
      dataIndex: 'price',
      align: 'right',
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          {t('table.labels.totalValue')}
        </h3>
      ),
      dataIndex: 'total',
      align: 'right',
    },
    ...transferColumn,
    {
      dataIndex: 'links',
      className: styles.LinksColumn,
    },
  ]
}

const getFreeAndLockedBalanceFromChildren = (
  children?: Partial<BalancesTableInfo>[]
) => {
  let freeBalance = BIGNUMBER_ZERO
  let lockedBalance = BIGNUMBER_ZERO

  children?.forEach((childrenInfo) => {
    switch (childrenInfo.key) {
      case 'reserved':
      case 'locked':
        lockedBalance = lockedBalance.plus(
          childrenInfo?.totalValue || BIGNUMBER_ZERO
        )
        break
      case 'frozen':
        break
      default:
        freeBalance = freeBalance.plus(
          childrenInfo?.totalValue || BIGNUMBER_ZERO
        )
        break
    }
  })

  return { freeBalance, lockedBalance }
}

type TransferModalState = {
  open: boolean
  defaultToken?: TransferFormDefaultToken
}
type TransferModalActions =
  | { type: 'OPEN'; payload?: TransferFormDefaultToken }
  | { type: 'CLOSE' }
const initialTransferModalState: TransferModalState = { open: false }
const transferModalReducer = (
  state: TransferModalState,
  action: TransferModalActions
): TransferModalState => {
  switch (action.type) {
    case 'OPEN':
      const defaultToken = state.defaultToken
      if (
        state.open &&
        defaultToken?.token === action.payload?.token &&
        defaultToken?.network === action.payload?.network
      )
        return state
      return {
        open: true,
        defaultToken: action.payload,
      }
    case 'CLOSE':
      if (!state.open) return state
      return {
        open: false,
      }
  }
}

export const BalancesTable = (props: BalanceTableProps) => {
  const {
    setBalances,
    isMulti,
    balances: { freeChainBalances, lockedChainBalances },
  } = useMyExtensionAccount()
  const { isMobile } = useResponsiveSize()
  const [ data, setData ] = useState<BalancesTableInfo[]>()
  const [ loading, setLoading ] = useState<boolean>(false)

  const tableVariantFromStore = store.get(BALANCE_TABLE_VARIANT)

  const [ balancesVariant, setBalancesVariant ] = useState<BalanceVariant>(
    tableVariantFromStore || 'chains'
  )
  const tokenPrices = usePrices()
  const dispatch = useAppDispatch()
  const {
    t,
    i18n: { language },
  } = useTranslation()
  const sendTransferEvent = useBuildSendEvent('click_on_transfer_button')

  const [ transferModalState, transferModalDispatch ] = useReducer(
    transferModalReducer,
    initialTransferModalState
  )

  const {
    chainsInfo,
    addresses,
    maxItems,
    showZeroBalance,
    showCheckBox,
    showTabs,
  } = props
  const isMyAddress = useIsMyConnectedAddress(addresses?.[0])

  const identities = useIdentitiesByAccounts(addresses)

  const balancesEntities = useManyBalances(addresses)

  const balancesLoading = isDataLoading(balancesEntities)

  const fetchBalancesFunc = () => fetchBalances(dispatch, addresses, true)

  useEffect(() => {
    setLoading(!balancesEntities ? true : !!balancesLoading)
  }, [ balancesLoading ])

  useEffect(() => {
    setLoading(true)
  }, [ JSON.stringify(tokenPrices) ])

  useEffect(() => {
    if (!addresses || !chainsInfo) return

    let isMounted = true

    const info = async () => {
      const props: ParseBalanceTableInfoProps = {
        chainsInfo,
        tokenPrices,
        identities,
        isMulti,
        balancesEntities,
        isMobile,
        onTransferClick: (token, network, tokenId) => {
          transferModalDispatch({
            type: 'OPEN',
            payload: { token, network, tokenId },
          })
          sendTransferEvent()
        },
        t,
      }

      const tableInfo: BalancesTableInfo[] =
        balancesVariant === 'chains'
          ? await parseBalancesTableInfo(props)
          : await parseTokenCentricView(props)

      if (tableInfo) {
        setData(tableInfo.filter(isDef))

        if (balancesLoading === false && balancesEntities) setLoading(false)
      }

      let freeChainBalances = BIGNUMBER_ZERO
      let lockedChainBalances = BIGNUMBER_ZERO

      tableInfo?.forEach((info) => {
        const childrenBalances = info?.children

        if (isMulti) {
          childrenBalances?.forEach((childrenInfo) => {
            const childrenBalancesByAccount = childrenInfo?.children

            const { freeCalculatedBalance, lockedCalculatedBalance } =
              calculateChildrenBalances(
                freeChainBalances,
                lockedChainBalances,
                childrenBalancesByAccount
              )

            freeChainBalances = freeCalculatedBalance
            lockedChainBalances = lockedCalculatedBalance
          })
        } else {
          if (balancesVariant === 'chains') {
            const { freeCalculatedBalance, lockedCalculatedBalance } =
              calculateChildrenBalances(
                freeChainBalances,
                lockedChainBalances,
                childrenBalances
              )

            freeChainBalances = freeCalculatedBalance
            lockedChainBalances = lockedCalculatedBalance
          } else {
            childrenBalances?.forEach((childrenBalance) => {
              const { freeCalculatedBalance, lockedCalculatedBalance } =
                calculateChildrenBalances(
                  freeChainBalances,
                  lockedChainBalances,
                  childrenBalance?.children
                )

              freeChainBalances = freeCalculatedBalance
              lockedChainBalances = lockedCalculatedBalance
            })
          }
        }
      })

      setBalances({ freeChainBalances, lockedChainBalances })
    }

    isMounted &&
      info().catch((err) =>
        console.error(
          'Failed to load account balances from multiple chains:',
          err
        )
      )
  }, [
    addresses?.join(','),
    JSON.stringify(balancesEntities || {}),
    isMulti,
    loading,
    language,
    balancesVariant,
  ])

  return (
    <>
      <CustomTable
        actionsConfig={{
          title: t('table.balances.title'),
          checkBoxText: showCheckBox
            ? t('table.balances.checkBoxText')
            : undefined,
          showTabs,
          refreshText: t('table.balances.refreshText'),
          buttonsClassName: clsx('bs-mt-2 align-items-center'),
        }}
        maxItems={maxItems}
        showZeroBalance={showZeroBalance}
        showAllPage={`${addresses?.join(',') || ''}/balances`}
        addresses={addresses}
        balanceKind='NativeToken'
        columns={getColumns(t, isMyAddress, balancesVariant)}
        loading={!!loading}
        setLoading={setLoading}
        loadingLabel={t('table.balances.loading')}
        createFieldSkeletons={(data) =>
          createFieldSkeletons(data as BalancesTableInfo[])
        }
        data={data}
        chainsInfo={chainsInfo}
        noData={t('table.balances.noData')}
        storeTableView={BALANCE_TABLE_VIEW}
        storeShowZeroBalance={BALANCE_SHOW_ZERO_BALANCES}
        onReload={fetchBalancesFunc}
        totalBalance={freeChainBalances.plus(lockedChainBalances)}
        tableTab={balancesVariant}
        tabs={
          <BalanceTableVariantTabs
            balancesVariant={balancesVariant}
            setBalancesVariant={setBalancesVariant}
          />
        }
      />
      <TransferModal
        visible={transferModalState.open}
        onCancel={() => transferModalDispatch({ type: 'CLOSE' })}
        defaultSelectedToken={transferModalState.defaultToken}
      />
    </>
  )
}

export default BalancesTable
