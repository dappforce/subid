import React, { CSSProperties } from 'react'
import { resolveIpfsUrl } from '.'

export type BgImgProps = {
  src: string
  size?: number | string
  height?: number | string
  width?: number | string
  rounded?: boolean
  className?: string
  style?: CSSProperties
}

export const DfBgImg = React.memo((props: BgImgProps) => {
  const { src, size, height = size, width = size, rounded = false, className, style } = props

  const fullClass = `DfBgImg ${className}`

  const fullStyle = {
    backgroundImage: `url(${resolveIpfsUrl(src)})`,
    width,
    height,
    minWidth: width,
    minHeight: height,
    borderRadius: rounded ? '50%' : undefined,
    ...style
  }

  return <div className={fullClass} style={fullStyle} />
})
