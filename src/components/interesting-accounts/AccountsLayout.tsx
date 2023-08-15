import { Col, Row, Tabs, Dropdown, Divider } from 'antd'
import { useCallback, useState, useEffect } from 'react'
import { useAppDispatch } from 'src/rtk/app/store'
import { getIconUrl } from '../utils'
import { DfBgImg } from '../utils/DfBgImg'
import { useIsMobileWidthOrDevice } from '../responsive/ResponsiveContext'
import styles from './InterestingAccounts.module.sass'
import { DownOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { fetchIdentities } from '../../rtk/features/identities/identitiesHooks'
import {
  DEFAULT_SELECTED_CHAIN,
  DEFAULT_TAB_KEY,
  Tab,
  TAB_KEYS,
  resolveSvgIcon,
} from './utils'
import { LoadMoreProps, AccountCardType, FetchFn } from './types'

import { InfinitePageList } from '../list/InfiniteList'
import { AccountCard } from './AccountCard'
import { relayChains } from '../table/utils'
import { RelayChain } from '../../types/index'
import { InterestingAccountsPageProps } from '../main/InterestingAccounts'
import { getAccountDataByChainNameAndType, MenuItems, CHAIN_ITEMS, parseCrowdloanersData } from './utils'
import clsx from 'clsx'
import { capitalize, shuffle } from 'lodash'
import { MutedSpan } from '../utils/MutedText'
import { useRouter } from 'next/router'
import { usePrices } from '../../rtk/features/prices/pricesHooks'
import { useChainInfo } from '../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { MultiChainInfo } from '../../rtk/features/multiChainInfo/types'
import { PageTitle } from '../utils/index'
import { 
  getAllInterestingAccounts, 
  getCouncilMembersByChain, 
  getCrowdloanContributorsByChain, 
  getValidatorsByChain 
} from 'src/api'

const { TabPane } = Tabs

const fetchFunctionByTab: Record<string, FetchFn> = {
  all: getAllInterestingAccounts,
  council: getCouncilMembersByChain,
  validator: getValidatorsByChain,
  crowdloaner: getCrowdloanContributorsByChain,
}

export const createLoadMoreInterestingAccountsFn = (
  getInterestingAccounts: FetchFn,
  chain: string,
  type: string,
  chainsInfo: MultiChainInfo,
  prices?: any[]
) => (
  async (props: LoadMoreProps): Promise<AccountCardType[]> => {
    const { dispatch, page, size } = props

    const offset = (page - 1) * size

    let interestingAccounts: AccountCardType[] = []

    if (chain === 'all') {
      const allAccountsPromise = relayChains.map(async (relayChain) =>
        getAccountDataByChainNameAndType({ getInterestingAccounts, relayChain, type, offset, size }))

      const allAccounts = await Promise.all(allAccountsPromise)

      interestingAccounts = allAccounts.flat()
    } else {
      interestingAccounts = await getAccountDataByChainNameAndType({
        getInterestingAccounts,
        relayChain: chain as RelayChain,
        type,
        offset,
        size
      })
    }

    const addresses = interestingAccounts.map(({ account }) => account)

    fetchIdentities(dispatch, addresses, false)

    if (type === 'crowdloaner') {
      return parseCrowdloanersData(interestingAccounts, chainsInfo, prices)
    }

    const shuffledInterestingAccounts = shuffle(interestingAccounts)

    return shuffledInterestingAccounts
  }
)

const AccountsLayout = ({ initialAccounts, accountsLength }: InterestingAccountsPageProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { query, push } = useRouter()

  const { chain, role } = query

  const [ selectedChain, setSelectedChain ] = useState<string>(chain as string || DEFAULT_SELECTED_CHAIN)
  const isMobile = useIsMobileWidthOrDevice()
  const [ tabVisible, setTabVisible ] = useState(false)
  const [ chainVisible, setChainVisible ] = useState(false)
  const prices = usePrices()
  const chainInfo = useChainInfo()

  const [ tabKey, setTabKey ] = useState(role as string || DEFAULT_TAB_KEY)

  const fetchFunction = fetchFunctionByTab[tabKey]

  const loadMore = createLoadMoreInterestingAccountsFn(fetchFunction, selectedChain, tabKey, chainInfo, prices)

  const onTabKeyChange = (key: string) => {
    setTabKey(key)
    setTabVisible(!tabVisible)

    const newPath = { ...query, role: key }
    push({ query: newPath })
  }

  const onSelectedChainChange = (key: string) => {
    setSelectedChain(key)
    setChainVisible(!chainVisible)

    const newQuery = { ...query, chain: key }
    push({ query: newQuery })
  }

  useEffect(() => {
    if (chain && selectedChain !== chain) setSelectedChain(chain as string)
    if (role && tabKey !== role) setTabKey(role as string)
  }, [ role, chain ])

  const selectedChainLabel = selectedChain === 'all' ? t('chains.allChains') : capitalize(selectedChain)
  const roleLabel = tabKey === 'all' ? t('interestingAccounts.allRoles') : t(`interestingAccounts.${tabKey}`)

  const List = useCallback(() => <InfinitePageList
    withLoadMoreLink
    loadingLabel='Loading more accounts...'
    loadMore={(page, size) => loadMore({ dispatch, page, size })}
    totalCount={accountsLength}
    dataSource={tabKey === 'all' && selectedChain === 'all' ? initialAccounts : undefined}
    noDataDesc='No spaces yet'
    getKey={(account: AccountCardType) => account.account}
    isCards
    renderItem={(account) =>
      <AccountCard accountData={account} className={tabKey !== 'all' && tabKey !== 'crowdloaner' ? styles.ShortCardDesc : undefined} />}
  />, [ tabKey, selectedChain ])

  return <div>
    <Row>
      <Col>
        <PageTitle 
          title={t('interestingAccounts.title')}
          className={clsx({ ['pr-3 pl-3']: isMobile })}
        />
      </Col>
    </Row >
    <Row justify='space-between' className={clsx({ ['pl-3 pr-3']: isMobile })}>
      <Col>
        <div className={styles.DropdownContainer}>
          {isMobile ?
            <Dropdown
              trigger={[ 'click' ]}
              visible={tabVisible}
              onVisibleChange={(v) => setTabVisible(v)}
              placement='bottomLeft'
              className={clsx('d-flex align-items-center justify-content-start w-auto', { ['bs-mt-2']: isMobile })}
              overlay={<MenuItems onTabChange={onTabKeyChange} data={TAB_KEYS} dropdownType='Roles' />}
            >
              <MutedSpan>{roleLabel} <DownOutlined className='ml-1 FontNormal' /></MutedSpan>
            </Dropdown> :
            <Tabs onChange={onTabKeyChange} activeKey={tabKey}>
              {TAB_KEYS.map((key) =>
                <TabPane key={key} tab={<Tab text={t(`interestingAccounts.${key === 'all' ? `${key}Roles` : key}`)} />} />
              )}
            </Tabs>}
        </div>
      </Col>
      <Col className={clsx('d-flex justify-content-end align-items-center', { ['bs-mt-2']: isMobile })}>
        <Dropdown
          trigger={[ 'click' ]}
          visible={chainVisible}
          onVisibleChange={setChainVisible}
          placement='bottomRight'
          className={`d-flex align-items-center ${styles.Dropdown}`}
          overlay={<MenuItems onTabChange={onSelectedChainChange} data={CHAIN_ITEMS} dropdownType='Chains' withIcon />}
        >
          <div className={styles.SelectedNetwork}>
            <DfBgImg
              className={`bs-mr-2 ${styles.TabIcon}`}
              src={getIconUrl(resolveSvgIcon(selectedChain))}
              size={18}
              rounded
            />

            <MutedSpan>{selectedChainLabel} <DownOutlined className='ml-1' /></MutedSpan>
          </div>
        </Dropdown>
      </Col>
    </Row>

    {isMobile && <div className='d-flex justify-content-center'><Divider className={styles.AccountsDivider} /></div>}

    <List />
  </div>
}

export default AccountsLayout
