import React from 'react'
import { AddressProps } from './utils/types'
import { toShortAddress } from '../../utils/index'
import { MutedSpan } from '../../utils/MutedText'
import { useExtensionName } from './utils'
import { AccountIdentities, Identity } from '../../identity/types'
import { getSubsocialIdentity } from '../../../rtk/features/identities/identitiesHooks'

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
  const { name: profileName } = getSubsocialIdentity(identities) || {}

  const extensionName = useExtensionName(address)
  const shortAddress = toShortAddress(address)
  const addressString = isShort ? shortAddress : address.toString()

  const kusamaIdentity = identities?.kusama as Identity | undefined
  const polkadotIdentity = identities?.polkadot as Identity | undefined

  const nonSubsocialIdentityName = kusamaIdentity?.info?.display || polkadotIdentity?.info?.display

  const name = profileName || nonSubsocialIdentityName || extensionName

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
