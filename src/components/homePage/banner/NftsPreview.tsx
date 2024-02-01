import { useManyNfts } from '../../../rtk/features/nfts/nftsHooks'
import { useMyAddresses, useMyAddress } from '../../providers/MyExtensionAccountsContext'
import { NftGrid, DEFAULT_PAGE } from '../../ntf/NftsLayout'
import { useEffect, useState } from 'react'
import { Pagination } from 'antd'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import styles from './NftsPreview.module.sass'
import { getSubsocialIdentityByAccount, useIdentitiesByAccounts } from 'src/rtk/features/identities/identitiesHooks'
import config from 'src/config'
import { isDef } from '@subsocial/utils'

const { supportedCollectionNames, collectionId } = config

const DEFAULT_PAGE_SIZE_FOR_BANNERS = 4

type NFtPreviewProps = {
  hide: () => void
  hasTokens?: boolean
}

const NftsPreview = ({ hide, hasTokens }: NFtPreviewProps) => {
  const addresses = useMyAddresses()
  const address = useMyAddress()

  const nftsEntities = useManyNfts(addresses)
  const [ page, setPage ] = useState<number>(DEFAULT_PAGE)
  const [ loading, setLoading ] = useState<boolean>(false)
  const { isMobile } = useResponsiveSize()
  const identites = useIdentitiesByAccounts(addresses)

  const { nfts, loading: nftsLoading } = nftsEntities || {}

  useEffect(() => {
    setPage(DEFAULT_PAGE)
  }, [ addresses?.join(',') ])

  useEffect(() => {
    setLoading(!nfts ? true : !!nftsLoading)
  }, [ nftsLoading ])

  const start = (page - 1) * DEFAULT_PAGE_SIZE_FOR_BANNERS
  const end = start + DEFAULT_PAGE_SIZE_FOR_BANNERS

  const allNfts = Object.values(nfts || {}).filter(isDef).flat()

  const nftsByCollectionId = allNfts
    .filter(x => supportedCollectionNames
      .some((collectionName) => x.id
        .toString()
        .includes(`${collectionId}-${collectionName}`)))

  const onPaginationChange = (page: number) => {
    setPage(page)
  }

  const subsocialItentity = getSubsocialIdentityByAccount(address, identites)

  return <>
    <div className={styles.NftsPreview}>
      <NftGrid
        nfts={nftsByCollectionId.slice(start, end)}
        nftsLoading={loading}
        withLink={false}
        withConnection
        owner={subsocialItentity}
        hide={hide}
        hasTokens={hasTokens}
      />

      <Pagination
        defaultCurrent={page}
        current={page}
        total={nftsByCollectionId?.length}
        pageSize={DEFAULT_PAGE_SIZE_FOR_BANNERS}
        hideOnSinglePage={nftsByCollectionId.length <= DEFAULT_PAGE_SIZE_FOR_BANNERS}
        onChange={onPaginationChange}
        className='bs-text-center mt-3'
        showLessItems={isMobile}
      />
    </div>

  </>
}

export default NftsPreview