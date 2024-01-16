import { useExtensionName } from '@/components/homePage/address-views/utils'
import { Identity } from '@/components/identity/types'
import { getSubsocialIdentity, useIdentities } from '@/rtk/features/identities/identitiesHooks'

const useGetProfileName = (address: string) => {
  const identities = useIdentities(address)
  const { name: profileName } = getSubsocialIdentity(identities) || {}

  const extensionName = useExtensionName(address)

  const kusamaIdentity = identities?.kusama as Identity | undefined
  const polkadotIdentity = identities?.polkadot as Identity | undefined

  const nonSubsocialIdentityName = kusamaIdentity?.info?.display || polkadotIdentity?.info?.display

  const name = profileName || nonSubsocialIdentityName || extensionName

  return name
}

export default useGetProfileName