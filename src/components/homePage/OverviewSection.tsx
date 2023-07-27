import { IdentityView } from '../identity/Identity'
import BalancesTable from '../table/balancesTable/BalanceTable'
import CrowdloansTable from '../table/contributionsTable/CrowdloanTable'
import NtfLayout from '../ntf/NftsLayout'
import { Overview } from '../overview/Overview'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { useIdentitiesByAccounts } from '../../rtk/features/identities/identitiesHooks'
import { toGenericAccountId } from '../../rtk/app/util'
import { PreviewAccountsGrid } from '../interesting-accounts/InterestingAccounts'
import { useIsMulti } from '../providers/MyExtensionAccountsContext'
import styles from './address-views/utils/index.module.sass'

type OverviewSectionProps = {
  addresses: string[]
}

export const MAX_ITEMS_FOR_TABLE = 6

const OverviewSection = ({ addresses }: OverviewSectionProps) => {
  const chainsInfo = useChainInfo()
  const isMulti = useIsMulti()
  const identities = useIdentitiesByAccounts(addresses)

  const address = !isMulti ? addresses[addresses.length - 1] : undefined

  const identity = address && identities ? identities[toGenericAccountId(address)] : undefined

  return <>
    <Overview />

    <div className={styles.SectionsGap}>
      <BalancesTable
        showTabs
        showZeroBalance
        showCheckBox={false}
        maxItems={MAX_ITEMS_FOR_TABLE}
        addresses={addresses}
        chainsInfo={chainsInfo} />
      <CrowdloansTable
        showTabs={false}
        maxItems={MAX_ITEMS_FOR_TABLE}
        addresses={addresses}
        chainsInfo={chainsInfo}
        relayChain='polkadot' />
      <CrowdloansTable
        showTabs={false}
        maxItems={MAX_ITEMS_FOR_TABLE}
        addresses={addresses}
        chainsInfo={chainsInfo}
        relayChain='kusama' />
      <NtfLayout addresses={addresses} />
      {address && <IdentityView
        address={address}
        details={identity}
        withSection
        withTitle={false}
      />}
      <PreviewAccountsGrid />
    </div>
  </>
}

export default OverviewSection