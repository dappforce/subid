import styles from './index.module.sass'
import React, { useState } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import Link from 'next/link'
import { CloseOutlined } from '@ant-design/icons'
import store from 'store'
import clsx from 'clsx'

const BANNER_STORAGE_KEY = 'df.proposal_banner'

const bannersKind = [ 'orange', 'pink' ]

export const ProposalBannerSection = () => {
  const { isMobile } = useResponsiveSize()

  const bannerFromStorage = store.get(BANNER_STORAGE_KEY)

  const [ showBanner, setShowBanner ] = useState(bannerFromStorage !== undefined ? bannerFromStorage : true)

  if (!showBanner) return null

  const kindIndex = new Date().getTime() % 2
  const kind = bannersKind[kindIndex]

  const backgroundImage = `/images/banners/proposal-${kind}-${isMobile ? 'mobile' : 'desktop'}.png`

  const closeBanner = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setShowBanner(false)
    store.set(BANNER_STORAGE_KEY, false)
  }

  const closeButton = <CloseOutlined
    className={styles.DfCloseButton}
    onClick={closeBanner}
  />

  return (
    <div
      className={clsx(styles.Banner, { [styles.MobileBannerMargin]: isMobile })}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: !isMobile ? 'center' : 'inherit'
      }}
    >{closeButton}</div>
  )
}

const ProposalBanner = () => (
  <Link href='https://kusama.subsquare.io/referenda/referendum/198'>
    <a target='_blank' rel='noreferrer'>
      <ProposalBannerSection />
    </a>
  </Link>
)

export default ProposalBanner
