import clsx from 'clsx'
import React from 'react'
import { CONTENT_TYPES } from 'src/types'
import styles from './NftsLayout.module.sass'
import dynamic from 'next/dynamic'
import Image from 'next/image'

type ContentViewSwitchProps = {
  contentType: CONTENT_TYPES
  isImage: boolean
  src: string
  name: string
  loading: boolean | undefined
  stubImage: string
  onLoad?: () => void
}

const ModelViewer = dynamic(() => import('../model-viewer'), { ssr: false })

export const ContentViewSwitch = ({ name, loading, onLoad, src, contentType, stubImage }: ContentViewSwitchProps) => {
  if(!src) return <img alt={name} src={`/images/${stubImage}`} className={styles.ImageMuted} onLoad={onLoad} />

  switch (contentType) {
    case CONTENT_TYPES.audio:
    case CONTENT_TYPES.gif:
    case CONTENT_TYPES.image:
      return <Image alt={name} src={`/api/imageProxy?imageUrl=${src}`} className={loading ? 'd-none' : 'd-block'} layout='fill' onLoad={onLoad} />
    case CONTENT_TYPES.video:
      return <video autoPlay loop muted src={src} className={clsx(styles.NftContent, loading ? 'd-none' : 'd-block')} onLoadStart={onLoad} />
    case CONTENT_TYPES.model:
      return <ModelViewer
        id={name}
        src={src}
        autoplay
        alt={name}
        className={styles.NftContent}
        style={{ position: 'absolute', height: '100%' }}
      />
    default:
      return <img alt={name} src={src} className={loading ? 'd-none' : 'd-block'} onLoad={onLoad} />
  }
}
