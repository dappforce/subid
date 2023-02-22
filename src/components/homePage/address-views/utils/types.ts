import React from 'react'
import { AnyAccountId } from '@subsocial/types'
import { AccountIdentities, SubsocialProfile } from '../../../identity/types'

export type AddressProps = {
  className?: string
  style?: React.CSSProperties
  address: AnyAccountId
  owner?: SubsocialProfile
}

export type AccountData = {
  address: string
  identities?: AccountIdentities
}
