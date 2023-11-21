import React from 'react'
import { AddressProps } from './utils/types'
import { toShortAddress } from '../../utils/index'
import { MutedSpan } from '../../utils/MutedText'
import { AccountIdentities } from '../../identity/types'
import useGetProfileName from '@/hooks/useGetProfileName'

type Props = AddressProps & {
  isShort?: boolean
  withShortAddress?: boolean
  identities?: AccountIdentities
  className?: string
}

export const Name = ({
  address,
  isShort = true,
  withShortAddress,
  className,
}: Props) => {
  const name = useGetProfileName(address.toString())

  const shortAddress = toShortAddress(address)
  const addressString = isShort ? shortAddress : address.toString()

  const title = name ? (
    <span
      className={
        withShortAddress ? 'd-flex justify-content-between flex-wrap w-100' : ''
      }
    >
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
