import { useIdentitiesByAccounts } from '@/rtk/features/identities/identitiesHooks'
import { getAddressFromStorage } from '../utils'
import Name from './address-views/Name'
import { toGenericAccountId } from '@/rtk/app/util'
import { useMemo, useState } from 'react'
import { IdentityPreview } from '../identity/Identity'
import { Identity } from '../identity/types'
import styles from './Index.module.sass'
import { isDef } from '@subsocial/utils'
import IdentitiesModal from '../identity/IdentitiesModal'

type NameWithIdentityProps = {
  addresses?: string[]
  address?: string
}

const NameWithIdentity = ({ address, addresses }: NameWithIdentityProps) => {
  const [ openModal, setOpenModal ] = useState(false)
  const addressFromStorage = getAddressFromStorage()
  const identitiesByAccount = useIdentitiesByAccounts(addresses)

  const identities =
    address && identitiesByAccount
      ? identitiesByAccount[toGenericAccountId(address)]
      : undefined

  const identityPreviews = useMemo(() => {
    if (!identities) return null

    const identitiesEntries = Object.entries(identities)

    const previews = identitiesEntries
      .map(([ network, identity ], i) => {
        if (network === 'subsocial') return

        const { isVerify } = identity as Identity

        return (
          <IdentityPreview
            key={i}
            network={network}
            isVerify={isVerify}
            showLabel={false}
          />
        )
      })
      .filter(isDef)

    return previews
  }, [ Object.values(identities || {}).length, address ])

  const showIdentities = !!identityPreviews?.length

  return (
    <>
      <div
        className={styles.NameWithIdentity}
        style={{ cursor: showIdentities ? 'pointer' : 'default' }}
        onClick={() => showIdentities && setOpenModal(true)}
      >
        <Name identities={identities} address={address || addressFromStorage} />
        {showIdentities && (
          <div className={styles.IdentitiesPreviews}>{identityPreviews.reverse()}</div>
        )}
      </div>
      {showIdentities && (
        <IdentitiesModal
          open={openModal}
          close={() => setOpenModal(false)}
          identities={identities}
          address={address}
        />
      )}
    </>
  )
}

export default NameWithIdentity
