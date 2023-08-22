import styles from './index.module.sass'
import React, { useState } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import Link from 'next/link'
import { CloseOutlined } from '@ant-design/icons'
import store from 'store'
import clsx from 'clsx'

const BANNER_STORAGE_KEY = 'df.proposal_banner'

export const ProposalBannerSection = () => {
  const { isMobile } = useResponsiveSize()

  const bannerFromStorage = store.get(BANNER_STORAGE_KEY)

  const [ showBanner, setShowBanner ] = useState(
    bannerFromStorage !== undefined ? bannerFromStorage : true
  )

  if (!showBanner) return null

  const backgroundImage = `/images/banners/open-comm-${
    isMobile ? 'mobile' : 'desktop'
  }.svg`

  const closeBanner = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setShowBanner(false)
    store.set(BANNER_STORAGE_KEY, false)
  }

  const closeButton = (
    <CloseOutlined className={styles.DfCloseButton} onClick={closeBanner} />
  )

  return (
    <div
      className={clsx(styles.Banner, { [styles.MobileBannerMargin]: isMobile })}
    >
      <img src={backgroundImage} alt='Banner image' className={styles.BannerImg} />
      {closeButton}
    </div>
  )
}

const ProposalBanner = () => (
  <Link href='https://polkadot.polkassembly.io/referenda/119'>
    <a target='_blank' rel='noreferrer'>
      <ProposalBannerSection />
    </a>
  </Link>
)

export default ProposalBanner
