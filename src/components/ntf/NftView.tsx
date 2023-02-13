import React, { useState, useEffect } from 'react'
import { Card, Skeleton } from 'antd'
import { fieldSkeleton, AccountPreview, getBalanceWithDecimals } from '../table/utils'
import { Nft } from '../../rtk/features/nfts/types'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { MultiChainInfo } from 'src/rtk/features/multiChainInfo/types'
import { BalanceView } from '../homePage/address-views/utils/index'
import styles from './NftsLayout.module.sass'
import { isEmptyArray } from '@subsocial/utils'
import { MutedSpan } from '../utils/MutedText'
import { CONTENT_TYPES } from 'src/types'
import { getContentType } from './types'
import { ContentViewSwitch } from './ContentViewSwitch'
import NftLabel from './NftLabel'
import { getSubsocialIdentityByAccount } from '../../rtk/features/identities/identitiesHooks'
import { AccountIdentitiesRecord } from '../../rtk/features/identities/identitiesSlice'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import BN from 'bignumber.js'
import { toShortMoney } from '../table/BalancesBarChart'
import { BIGNUMBER_ZERO } from '../../config/app/consts'

export type NftViewProps = {
  nft: Nft
  nftsLoading: boolean
  identities?: AccountIdentitiesRecord
  isMulti?: boolean
  withLink?: boolean
  onCardClick?: () => void
}

type PriceWithDecimalProps = {
  chainInfo: MultiChainInfo
  chain: string
  price?: string
  contentType?: CONTENT_TYPES
  isShortFormat?: boolean
  className?: string
  dataText?: string
}

export const PriceWithDecimal = ({ chainInfo, chain, contentType, price, className, isShortFormat = false, dataText }: PriceWithDecimalProps) => {
  const { t } = useTranslation()

  const kusamaChainInfo = chainInfo[chain]
  if (!kusamaChainInfo) return null

  const { tokenDecimals, tokenSymbols } = kusamaChainInfo

  const decimals = tokenDecimals && !isEmptyArray(tokenDecimals) ? tokenDecimals[0] : 0
  const symbol = tokenSymbols && !isEmptyArray(tokenSymbols) ? tokenSymbols[0] : ''

  const formatPriceValue = price ? getBalanceWithDecimals({ totalBalance: new BN(price).toString(), decimals }) : BIGNUMBER_ZERO

  return <div className={clsx('d-flex flex-row justify-content-between align-items-center m-0', className)} data-text={dataText}>
    {price ? <BalanceView
      value={isShortFormat ? toShortMoney({ num: formatPriceValue.toNumber() }) : formatPriceValue}
      symbol={symbol}
      withComma={false}
    /> : <MutedSpan>{t('general.notListed')}</MutedSpan>}
    {contentType && <NftLabel contentType={contentType} />}
  </div>
}

const NftView: React.FunctionComponent<NftViewProps> = ({
  nft: { id, name, image, price, link, contentType, animationUrl, account, stubImage },
  nftsLoading,
  identities,
  isMulti,
  withLink = true,
  onCardClick
}: NftViewProps) => {
  const chainInfo = useChainInfo()
  const [ loading, setLoading ] = useState<boolean>()
  const { isMobile } = useResponsiveSize()

  useEffect(() => {
    setLoading(nftsLoading)
  }, [ nftsLoading ])

  const mediaContentType = getContentType(contentType)
  const contentSrc = [ CONTENT_TYPES.image, CONTENT_TYPES.gif, CONTENT_TYPES.audio ].includes(mediaContentType)
    ? image
    : animationUrl || image

  const isImage =
    Boolean(image) &&
    Boolean(animationUrl) &&
    ![ CONTENT_TYPES.image, CONTENT_TYPES.gif ].includes(mediaContentType)

  const subsocialIdentity = getSubsocialIdentityByAccount(account, identities)

  const priceView = <>
    <div>{loading ? fieldSkeleton : <PriceWithDecimal chainInfo={chainInfo} chain='kusama' contentType={mediaContentType} price={price} />}</div>

    {isMulti && account && <AccountPreview
      avatar={subsocialIdentity?.content?.image}
      account={account}
      withCopy={false}
      withQr={false}
      isMonosizedFont={false}
      halfLength={isMobile ? 4 : 6}
      className='mt-1'
      withName={false}
    />}
  </>

  const rmrk2ClassName = link?.includes('rmrk2') ? styles.Rmrk2 : ''

  const card = <Card
    onClick={onCardClick}
    className={`${styles.NftCard} ${rmrk2ClassName}`}
    cover={
      <>
        <ContentViewSwitch
          name={name}
          src={contentSrc}
          contentType={mediaContentType}
          isImage={isImage}
          loading={loading}
          onLoad={() => setLoading(false)}
          stubImage={stubImage}
        />
        {loading && <Skeleton.Image className={styles.SkeletonImage} />}
      </>}
  >
    <Card.Meta title={name} description={priceView} />
  </Card>

  return withLink ? <a href={link} key={id} target='_blank' rel='noreferrer'>{card}</a> : card
}

export default NftView