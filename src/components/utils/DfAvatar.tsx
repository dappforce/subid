import React, { CSSProperties } from 'react'
import { isEmptyStr } from '@subsocial/utils'
import { AnyAccountId } from '@subsocial/types'
import { DEFAULT_AVATAR_SIZE } from './Size.config'
import IdentityIcon from './IdentityIcon'
import { DfBgImg } from './DfBgImg'

export type BaseAvatarProps = {
  size?: number
  style?: CSSProperties
  avatar?: string
  address?: AnyAccountId
}

const avatarCss = 'DfAvatar ui--IdentityIcon mr-2'

export const BaseAvatar = (props: BaseAvatarProps) => {
  const { size = DEFAULT_AVATAR_SIZE, avatar, style, address } = props

  if (!avatar || isEmptyStr(avatar)) {
    return <IdentityIcon style={style} size={size} value={address} />
  }

  return <DfBgImg style={style} size={size} src={avatar} className={avatarCss} rounded />
}

export default BaseAvatar
