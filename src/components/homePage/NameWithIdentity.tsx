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
  const [openModal, setOpenModal] = useState(false)
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
      .map(([network, identity], i) => {
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

    return <div className={styles.IdentitiesPreviews}>{previews}</div>
  }, [Object.values(identities || {}).length, address])

  return (
    <>
      <div
        className={styles.NameWithIdentity}
        onClick={() => setOpenModal(true)}
      >
        <Name identities={identities} address={address || addressFromStorage} />
        {identityPreviews}
      </div>
      <IdentitiesModal
        open={openModal}
        close={() => setOpenModal(false)}
        identities={identities}
        address={address}
      />
    </>
  )
}

export default NameWithIdentity
