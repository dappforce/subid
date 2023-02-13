import React from 'react'
import { AnyAccountId } from '@subsocial/types'
import { SpaceData } from '@subsocial/types/dto'
import { AccountIdentities } from '../../../identity/types'

export type AddressProps = {
  className?: string
  style?: React.CSSProperties
  address: AnyAccountId
  owner?: SpaceData
}

export type AccountData = {
  address: string
  identities?: AccountIdentities
}
