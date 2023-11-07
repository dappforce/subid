import { Col, Pagination, Row, Tabs, Button, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { isEmptyArray } from '@subsocial/utils'
import { useTranslation } from 'react-i18next'
import NoData from '../utils/EmptyList'
import { getIconUrl, Loading } from '../utils'
import styles from './NftsLayout.module.sass'
import { DfBgImg } from '../utils/DfBgImg'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import store from 'store'
import { MutedSpan } from '../utils/MutedText'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { fetchNfts, useFetchNfts, useManyNfts } from '../../rtk/features/nfts/nftsHooks'
import { Nft } from '../../rtk/features/nfts/types'
import { useAppDispatch } from '../../rtk/app/store'
import { useIdentitiesByAccounts } from '../../rtk/features/identities/identitiesHooks'
import { useIsMulti } from '../providers/MyExtensionAccountsContext'
import { AccountIdentitiesRecord } from '../../rtk/features/identities/identitiesSlice'
import clsx from 'clsx'
import NftItem from './NftItem'
import { SectionTitle } from '../utils/index'
import { SubsocialProfile } from '../identity/types'

const { TabPane } = Tabs

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 6
const DEFAULT_TAB_KEY = 'all'
const STORE_PAGE_SIZE = 'PageSize'

type TabWithLogoType = {
  icon?: string
  count?: string
  text: string
}

const TabWithLogo = ({ icon, text, count }: TabWithLogoType) => {
  return <div className='d-flex align-items-center mr-1 ml-1'>
    {icon && <DfBgImg className='bs-mr-2' src={icon} size={16} rounded />}
    <span>{text}</span>
    {count && <MutedSpan className='ml-2'>{count}</MutedSpan>}
  </div>
}

export type NftGridProps = {
  nfts: Nft[]
  nftsLoading: boolean
  identities?: AccountIdentitiesRecord
  isMulti?: boolean
  withLink?: boolean
  desktopDivider?: number
  mobileDivider?: number
  withConnection?: boolean
  owner?: SubsocialProfile
  hide?: () => void
  hasTokens?: boolean
}

export const NftGrid = ({
  nfts,
  nftsLoading,
  isMulti,
  identities,
  withLink = true,
  withConnection = false,
  owner,
  hide,
  hasTokens
}: NftGridProps) => {
  const { t } = useTranslation()

  if (isEmptyArray(nfts) && nftsLoading) return (
    <div className={clsx(styles.TableLoading)}>
      <Loading label={t('loading.loadingNfts')} />
    </div>
  )

  const hasProfile = !!owner

  return !isEmptyArray(nfts) ? (
    <div>
      <Row>
        {nfts.map((x) => (
          <Col key={x.id + x.name}>
            <NftItem
              nftsLoading={nftsLoading}
              nft={x}
              identities={identities}
              isMulti={isMulti}
              withLink={withLink}
              withConnection={withConnection}
              owner={owner}
              hasProfile={hasProfile}
              hide={hide}
              hasTokens={hasTokens}
            />
          </Col>
        ))}
      </Row>
    </div>
  ) : <NoData description={t('placeholders.noNFTsFound')} />
}

type NftsLayoutProps = {
  addresses?: string[]
}

const NtfLayout = ({ addresses }: NftsLayoutProps) => {
  useFetchNfts()
  
  const [ page, setPage ] = useState<number>(DEFAULT_PAGE)
  const isMulti = useIsMulti()
  const { isMobile } = useResponsiveSize()
  const { t } = useTranslation()

  const identities = useIdentitiesByAccounts(addresses)

  const pageSizeFromStorage = store.get(STORE_PAGE_SIZE)
  const [ pageSize, setPageSize ] = useState<number>(pageSizeFromStorage || DEFAULT_PAGE_SIZE)
  const [ loading, setLoading ] = useState<boolean>(false)
  const [ tabKey, setTabKey ] = useState(DEFAULT_TAB_KEY)
  const dispatch = useAppDispatch()

  const nftsEntities = useManyNfts(addresses)

  const { nfts, loading: nftsLoading } = nftsEntities || {}

  useEffect(() => {
    setPage(DEFAULT_PAGE)
    setPageSize(pageSizeFromStorage || DEFAULT_PAGE_SIZE)
    setTabKey(DEFAULT_TAB_KEY)
  }, [ addresses?.join(',') ])

  const fetchNftsFunc = () => fetchNfts(dispatch, addresses || [], true)

  useEffect(() => {
    setLoading(!nfts ? true : !!nftsLoading)
  }, [ nftsLoading ])


  useEffect(() => {
    if (nftsLoading === false && nfts) setLoading(false)
  }, [ loading ])

  const {
    rmrk2 = [],
    rmrk1 = [],
    statemine = [],
  } = nfts || {}

  const dataByKey: Record<string, Nft[]> = {
    all: [ ...rmrk2, ...rmrk1, ...statemine ],
    rmrk2,
    rmrk1,
    statemine,
  }

  const start = (page - 1) * pageSize
  const end = start + pageSize

  const onPaginationChange = (page: number, pageSize: number | undefined) => {
    setPage(page)
    if (pageSize) {
      setPageSize(pageSize)
      store.set(STORE_PAGE_SIZE, pageSize)
    }
  }

  const onTabKeyChange = (key: string) => {
    setTabKey(key)
    setPage(DEFAULT_PAGE)
  }

  const onReloadClick = () => fetchNftsFunc()

  if (!dataByKey) return <Loading />

  const data = dataByKey[tabKey]

  return (<div>
    <Row justify='space-between' className='align-items-center'>
      <Col>
        <SectionTitle title='NFTs' className={clsx({ ['pr-3 pl-3']: isMobile }, 'bs-mb-0')}/>
      </Col>
      <Col className={`${isMobile ? 'bs-mr-3' : ''} align-self-center`}>
        <Tooltip title={t('tooltip.refreshNFTs')}>
          <Button onClick={onReloadClick} disabled={loading}>
            {loading
              ? <LoadingOutlined />
              : <ReloadOutlined />
            }
          </Button>
        </Tooltip>
      </Col>
    </Row>
    <div className={styles.NftBlock}>
      <Tabs onChange={onTabKeyChange} activeKey={tabKey}>
        <TabPane key='all' tab={<TabWithLogo text='All' />} />
        <TabPane key='rmrk1' tab={<TabWithLogo count={rmrk1.length.toString()} icon='/images/rmrk.jpeg' text='RMRK 1' />} />
        <TabPane key='rmrk2' tab={<TabWithLogo count={rmrk2.length.toString()} icon='/images/rmrk.jpeg' text='RMRK 2' />} />
        <TabPane key='statemine' tab={<TabWithLogo count={statemine.length.toString()} icon={getIconUrl('statemine.svg')} text='Statemine' />} />
      </Tabs>

      <NftGrid nfts={data.slice(start, end)} nftsLoading={loading} isMulti={isMulti} identities={identities} />

      <Pagination
        defaultCurrent={page}
        current={page}
        total={data?.length}
        pageSize={pageSize}
        pageSizeOptions={[ '6', '9', '12' ]}
        showSizeChanger={true}
        hideOnSinglePage={data.length <= DEFAULT_PAGE_SIZE}
        onChange={onPaginationChange}
        className='text-center mt-3'
        showLessItems={isMobile}
      />
    </div>
  </div>)
}

export default NtfLayout
