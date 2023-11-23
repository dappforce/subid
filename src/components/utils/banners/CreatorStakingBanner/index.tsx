import styles from './index.module.sass'
import React, { useState } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import Link from 'next/link'
import { CloseOutlined } from '@ant-design/icons'
import store from 'store'
import clsx from 'clsx'
import { useBuildSendEvent } from 'src/components/providers/AnalyticContext'

const BANNER_STORAGE_KEY = 'df.creator_staking_banner'

export const CreatorStakingBannerSection = () => {
  const { isMobile } = useResponsiveSize()

  const bannerFromStorage = store.get(BANNER_STORAGE_KEY)

  const [ showBanner, setShowBanner ] = useState(
    bannerFromStorage !== undefined ? bannerFromStorage : true
  )

  if (!showBanner) return null

  const backgroundImage = `/images/banners/creator-staking-${
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

const ProposalBanner = () => {
  const href = 'https://sub.id/creators'
  const sendEvent = useBuildSendEvent('promo_banner_clicked')

  return <Link href='https://sub.id/creators' legacyBehavior>
    <a target='_blank' rel='noreferrer' onClick={() => sendEvent({ value: href })}>
      <CreatorStakingBannerSection />
    </a>
  </Link>
}

export default ProposalBanner
