import styles from './index.module.sass'
import React, { useState } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import Link from 'next/link'
import { CloseOutlined } from '@ant-design/icons'
import store from 'store'
import clsx from 'clsx'
import { useBuildSendEvent } from 'src/components/providers/AnalyticContext'

const BANNER_STORAGE_KEY = 'df.promo_banner'

export const BannerSection = () => {
  const { isMobile } = useResponsiveSize()

  const bannerFromStorage = store.get(BANNER_STORAGE_KEY)

  const [ showBanner, setShowBanner ] = useState(
    bannerFromStorage !== undefined ? bannerFromStorage : true
  )

  if (!showBanner) return null

  const backgroundImage = `/images/banners/sub-${
    isMobile ? 'mobile.png' : 'desktop.png'
  }`

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

const PromoBanner = () => {
  const href = 'https://docs.subsocial.network/docs/tutorials/get-sub'
  const sendEvent = useBuildSendEvent('promo_banner_clicked')

  return <Link href={href} legacyBehavior>
    <a target='_blank' rel='noreferrer' onClick={() => sendEvent({ value: href })}>
      <BannerSection />
    </a>
  </Link>
}

export default PromoBanner
