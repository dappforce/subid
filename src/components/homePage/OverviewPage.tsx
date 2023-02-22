import React from 'react'
import { MutedDiv } from '../utils/MutedText'
import Section from '../utils/Section'
import Name from './address-views/Name'
import { CopyAddress } from './address-views/utils'
import { LARGE_AVATAR_SIZE } from '../utils/Size.config'
import {
  toShortAddress,
  convertAddressToChainFormat,
} from '../utils/index'
import { DfMd } from '../utils/DfMd'
import { useMyExtensionAddresses } from '../providers/MyExtensionAccountsContext'
import { useResponsiveSize } from '../responsive'
import BaseAvatar from '../utils/DfAvatar'
import styles from './address-views/utils/index.module.sass'
import { LinkWithIcon } from '../table/utils'
import { resolveStatescanUrl } from '../table/links'
import { AddressQrModal } from '../qrs/QrModal'
import clsx from 'clsx'
import { useChainInfo } from '../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { allAccountsAvatar } from './address-views/utils/index'
import { toGenericAccountId } from 'src/rtk/app/util'
import { useIdentitiesByAccounts, getSubsocialIdentity } from '../../rtk/features/identities/identitiesHooks'
import { useIsMulti } from '../providers/MyExtensionAccountsContext'
import { useTranslation } from 'react-i18next'
import ActionButtons from './ActionButtons'
import BannerSection from './banner/bannerSection/BannerSection'
import { SubsocialProfile } from '../identity/types'

export type Props = {
  addresses?: string[]
  owner?: SubsocialProfile
  size?: number
  addressFromStorage: string
}

export const AccountInfo = (props: Props) => {
  const {
    addresses,
    size = LARGE_AVATAR_SIZE,
    addressFromStorage,
  } = props
  const { isMobile } = useResponsiveSize()

  const identitiesByAccount = useIdentitiesByAccounts(addresses)

  const isMulti = useIsMulti()

  const address = !isMulti && addresses ? addresses[addresses.length - 1] : undefined

  const identities = address && identitiesByAccount ? identitiesByAccount[toGenericAccountId(address)] : undefined
  const owner = getSubsocialIdentity(identities)

  const { t } = useTranslation()

  const accounts = useMyExtensionAddresses()
  const chains = useChainInfo()

  let { image: accountAvatar, about: accountDescription } = owner || {}

  if (isMulti === true) {
    accountDescription = t('general.allAccountsDesc')
    accountAvatar = allAccountsAvatar
  }

  const Avatar = <BaseAvatar size={size || LARGE_AVATAR_SIZE} address={address} avatar={accountAvatar} />

  const isMyExtensionAddress = accounts?.find((x) => x.address === address)

  const showFollowButton =
    !addressFromStorage || isMobile || !isMyExtensionAddress

  const genericAccountId = toGenericAccountId(address?.toString())

  const ksmAddress = convertAddressToChainFormat(
    address?.toString(),
    chains?.kusama?.ss58Format
  )

  const addressView = (
    <div className={clsx({ ['mt-3']: !isMobile }, 'd-flex align-items-center')}>
      <div className='d-flex'>
        {address && <MutedDiv className='d-flex mr-2 align-items-center'>
          <img src='/images/wallet.svg' className={styles.Icon} />{' '}
          <CopyAddress address={address} iconVisibility>
            {isMobile ? toShortAddress(genericAccountId) : genericAccountId}
          </CopyAddress>
        </MutedDiv>}
      </div>
      <div className='d-flex align-items-center'>
        {address && <AddressQrModal className='grey-light' address={address.toString()} openFromUrl />}

        {ksmAddress && (
          <LinkWithIcon
            link={resolveStatescanUrl(ksmAddress)}
            className={clsx(styles.StatescanLink, 'grey-light')}
            withCircle={false}
            title={t('buttons.viewAddressOn', { website: 'Statescan.io' })}
            icon='/images/statescan.svg'
          />
        )}
      </div>
    </div>
  )

  const actionButtons = <ActionButtons identities={identities} showFollowButton={showFollowButton} address={address} />

  return (
    <Section className={clsx('mb-3', styles.AccountOverview)}>
      {!isMulti && <BannerSection
        currentAddress={address}
        owner={owner}
      />}

      <div className={clsx({ ['d-flex align-items-start']: !isMobile }, styles.AccountSection)} >
        <div className={clsx('d-flex justify-content-between')}>
          {Avatar}
          {isMobile && actionButtons}
        </div>
        <div className={clsx('w-100', { ['ml-2']: !isMobile })}>
          <h1 className={clsx({ ['mt-3']: isMobile }, 'header DfAccountTitle justify-content-between')}>
            {address || isMulti === false 
              ? <Name identities={identities} address={address || addressFromStorage} /> 
              : t('general.allAccounts')}
            {!isMobile && actionButtons}
          </h1>
          {addressView}
          {accountDescription && <DfMd className={`mt-3 ${styles.About}`} source={accountDescription} />}
        </div>
      </div>

    </Section>
  )
}

export default AccountInfo
