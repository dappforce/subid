import { Menu } from 'antd'
import { useTranslation } from 'react-i18next'
import { getIconUrl } from '../utils/index'
import styles from './InterestingAccounts.module.sass'
import { DfBgImg } from '../utils/DfBgImg'
import { FetchFn, AccountCardType } from './types'
import { RelayChain } from '../../types/index'
import { isEmptyArray } from '@subsocial/utils'
import { getPrice, getBalanceWithDecimals, getTotalBalance } from '../table/utils'
import BN from 'bignumber.js'
import { MultiChainInfo } from '../../rtk/features/multiChainInfo/types'

export const DEFAULT_FETCH_LIMIT = 12
export const DEFAULT_TAB_KEY = 'all'
export const DEFAULT_SELECTED_CHAIN = 'all'
export const TAB_KEYS = [ 'all', 'council', 'validator', 'crowdloaner' ]
export const CHAIN_ITEMS = [ 'all', 'polkadot', 'kusama' ]
export type TabType = 'all' | 'council' | 'validator' | 'crowdloaner'

type DropdownType = 'Chains' | 'Roles'

type MenuItemsProps = {
  onTabChange: (key: string) => void
  data: string[]
  dropdownType: DropdownType
  withIcon?: boolean
}

export const MenuItems = ({ dropdownType, onTabChange, data, withIcon = false }: MenuItemsProps) => {
  const { t } = useTranslation()

  const translation = dropdownType === 'Roles' ? 'interestingAccounts' : 'chains'

  return <Menu className={styles.MenuOverlay} onClick={({ key }) => onTabChange(key.toString())}>
    {data.map((key) => <Menu.Item className={styles.MenuItem} key={key}>
      <Tab
        text={t(`${translation}.${key === 'all' ? `${key}${dropdownType}` : key}`)}
        icon={withIcon ? getIconUrl(resolveSvgIcon(key)) : undefined}
      />
    </Menu.Item>)}
  </Menu>
}

type TabProps = {
  icon?: string
  text: string
}

export const Tab = ({ icon, text }: TabProps) => {
  return <div className='d-flex align-items-center mr-1 ml-1'>
    {icon && <DfBgImg className={`mr-2 ${styles.TabIcon}`} src={icon} size={16} rounded />}
    <span>{text}</span>
  </div>
}

type AccountDataByChainNameAndType = {
  getInterestingAccounts: FetchFn
  relayChain: RelayChain
  type: string
  offset: number
  size: number
}

export const getAccountDataByChainNameAndType = async ({
  getInterestingAccounts,
  relayChain,
  type,
  offset,
  size
}: AccountDataByChainNameAndType): Promise<AccountCardType[]> => {
  const accounts = await getInterestingAccounts(relayChain, offset, size)

  if (type === 'all') {
    return accounts
  }

  const interestingAccounts = (accounts).map(({ account, amount }) => {
    return { account, relayChain, type, amount }
  })

  return interestingAccounts
}

export const resolveSvgIcon = (iconName: string) => `${iconName}.svg`

export const parseCrowdloanersData = (interestingAccounts: AccountCardType[], chainsInfo: MultiChainInfo, prices?: any[]) => {
  const interestingAccountsWithAmountInDollars = interestingAccounts.map(x => {
    const { amount, relayChain } = x

    const { tokenDecimals, tokenSymbols } = chainsInfo[relayChain]

    const decimals = tokenDecimals && !isEmptyArray(tokenDecimals) ? tokenDecimals[0] : 0
    const symbol = tokenSymbols && !isEmptyArray(tokenSymbols) ? tokenSymbols[0] : ''

    const price = getPrice(prices || [], 'symbol', symbol)

    const amountInDollars = getBalanceWithDecimals({ totalBalance: new BN(amount || '').toString(), decimals })

    const totalAmount = getTotalBalance(amountInDollars, price)

    return {
      ...x,
      totalAmount
    }

  })

  return interestingAccountsWithAmountInDollars
    .sort((a, b) => b.totalAmount.minus(a.totalAmount).toNumber())
}