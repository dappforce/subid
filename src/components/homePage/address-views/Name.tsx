import React from 'react'
import { SpaceData } from '@subsocial/types/dto'
import { AddressProps } from './utils/types'
import { toShortAddress } from '../../utils/index'
import { MutedSpan } from '../../utils/MutedText'
import { useExtensionName } from './utils'
import { AccountIdentities, Identity } from '../../identity/types'

type Props = AddressProps & {
  isShort?: boolean
  withShortAddress?: boolean
  identities?: AccountIdentities
  className?: string
}

export const Name = ({
  address,
  identities,
  isShort = true,
  withShortAddress,
  className
}: Props) => {
  const { content } = identities?.subsocial as SpaceData || {}

  const extensionName = useExtensionName(address)
  const shortAddress = toShortAddress(address)
  const addressString = isShort ? shortAddress : address.toString()

  const kusamaIdentity = identities?.kusama as Identity | undefined
  const polkadotIdentity = identities?.polkadot as Identity | undefined

  const nonSubsocialIdentityName = kusamaIdentity?.info?.display || polkadotIdentity?.info?.display

  const name = content?.name || nonSubsocialIdentityName || extensionName

  const title = name ? (
    <span className={withShortAddress ? 'd-flex justify-content-between flex-wrap w-100' : ''}>
      <span className='align-items-center'>{name}</span>
      {withShortAddress && (
        <MutedSpan>
          <code>{shortAddress}</code>
        </MutedSpan>
      )}
    </span>
  ) : (
    <span className='align-items-center'>{addressString}</span>
  )

  return <span className={className}>{title}</span>
}

export default Name
