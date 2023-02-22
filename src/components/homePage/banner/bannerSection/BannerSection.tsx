import styles from './BannerSection.module.sass'
import { GrImage } from 'react-icons/gr'
import { SubIcon } from '../../../utils/index'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import { useNfts } from '../../../../rtk/features/nfts/nftsHooks'
import { getContentType } from '../../../ntf/types'
import { CONTENT_TYPES } from '../../../../types/index'
import { ExtendedSpaceContent } from '../../../utils/getTxParams'
import { ContentViewSwitch } from '../../../ntf/ContentViewSwitch'
import { NftNetwork } from '../../../../rtk/features/nfts/types'
import SelectBannerModal from './SelectBannerModal'
import { useState } from 'react'
import { PriceWithDecimal } from '../../../ntf/NftView'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { useBuildSendGaUserEvent } from 'src/ga'
import { SubsocialProfile } from '../../../identity/types'

type BannerSectionProps = {
  currentAddress?: string
  owner?: SubsocialProfile
}

const IMAGE_CONTENT_SET = new Set([ CONTENT_TYPES.image, CONTENT_TYPES.gif ])
const SUPPORTED_CONTENT_SET = new Set([ CONTENT_TYPES.image, CONTENT_TYPES.gif, CONTENT_TYPES.audio ])

const BannerSection = ({ currentAddress, owner }: BannerSectionProps) => {
  const [ showBannerModal, setShowBannerModal ] = useState<boolean>(false)
  const chainInfo = useChainInfo()
  const { t } = useTranslation()

  const myAddress = useMyAddress()
  const sendGaEditBannerEvent = useBuildSendGaUserEvent('Click on Edit Banner')

  const isMyAddress = myAddress === currentAddress

  const nfts = useNfts(currentAddress)?.nfts

  const experimental = owner?.experimental as ExtendedSpaceContent | undefined

  const [ network, bannerId ] = (experimental?.banner || '').split('://')

  const nftsByNetwork = nfts ? nfts[network as NftNetwork] : undefined

  const nftBanner = nftsByNetwork?.find(x => x.id == bannerId)

  const { name = '', image, animationUrl, contentType, stubImage = '', price, link } = nftBanner || {}

  const mediaContentType = getContentType(contentType)

  const contentSrc = SUPPORTED_CONTENT_SET.has(mediaContentType)
    ? image
    : animationUrl || image

  if (!isMyAddress && !nftBanner) return null 

  const isImage =
    Boolean(image) &&
    Boolean(animationUrl) &&
    !IMAGE_CONTENT_SET.has(mediaContentType)

  const bannerImg = <>
    <ContentViewSwitch
      name={name}
      src={contentSrc || ''}
      contentType={mediaContentType}
      isImage={isImage}
      loading={false}
      stubImage={stubImage}
    />
    <div className={styles.PriceLabel}>
      {price ? <PriceWithDecimal chainInfo={chainInfo} chain='kusama' price={price} dataText='Buy NFT for' /> : <div>NFT</div>}
    </div>
  </>

  const onClickChangeBanner = () => {
    sendGaEditBannerEvent()
    setShowBannerModal(true)
  }

  return <div className={clsx(styles.BannerSection, { [styles.PriceLabelAnimation]: !isMyAddress && price })} >
    {nftBanner
      ? !isMyAddress
        ? <a href={link} target='_blank' rel='noreferrer'>{bannerImg}</a> : bannerImg
      : <img src='/images/banner-bg.svg' alt='' />}
    {isMyAddress && <div className={styles.BannerOverlay} onClick={onClickChangeBanner}>
      <SubIcon Icon={GrImage} />
      <div className='font-weight-bold'>{t('banner.placeholderTitle')}</div>
      <div className={styles.Desc}>{t('banner.placeholderDesc')}</div>
    </div>}
    <SelectBannerModal open={showBannerModal} hide={() => setShowBannerModal(false)} />
  </div>
}

export default BannerSection