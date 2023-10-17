import React from 'react'
import { AccountIdentities, SubsocialProfile } from '../../../identity/types'
import { AnyAccountId } from '@subsocial/api/types'

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
