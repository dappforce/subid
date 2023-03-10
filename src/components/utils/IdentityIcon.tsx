// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IdentityProps } from '@polkadot/react-identicon/types'

import React from 'react'
import BaseIdentityIcon from '@polkadot/react-identicon'
import Avatar from 'antd/lib/avatar/avatar'
import { DEFAULT_AVATAR_SIZE } from './Size.config'
import { isEthereumAddress } from '@polkadot/util-crypto'

const DEFAULT_THEME = 'substrate'

export const IdentityIcon = React.memo((allProps: IdentityProps) => {
  const { prefix, theme, value, size = DEFAULT_AVATAR_SIZE, ...props } = allProps
  const address = value?.toString() || ''
  const thisTheme = isEthereumAddress(address) ? 'ethereum' : theme || DEFAULT_THEME

  return (
    <Avatar
      icon={(
        <BaseIdentityIcon
          isHighlight
          prefix={prefix}
          theme={thisTheme}
          value={address}
          size={size - 2}
          {...props}
        />
      )}
      size={size}
      className='DfIdentityIcon'
      {...props}
      style={{ minHeight: size, minWidth: size }}
    />
  )
})

export default IdentityIcon
