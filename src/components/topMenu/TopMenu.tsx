import { MenuOutlined, CloseCircleOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons'
import { InjectedAccount } from '@polkadot/extension-inject/types'
import { Button, Divider, Dropdown, Menu, Tooltip } from 'antd'
import { useState } from 'react'
import Name from '../homePage/address-views/Name'
import { ExternalLink } from '../identity/utils'
import {
  useIsSignedIn,
  useMyAddresses,
  useMyExtensionAccount,
  useMyExtensionAddresses,
  useCurrentAccount
} from '../providers/MyExtensionAccountsContext'
import { useResponsiveSize } from '../responsive'
import SearchInput from '../search/SearchInput'
import { getAddressFromStorage, setAddressToStorage } from '../utils'
import BaseAvatar from '../utils/DfAvatar'
import { toShortAddress, checkIsMulti, isAccountsPage, isFavorites } from '../utils/index'
import styles from './TopMeny.module.sass'
import { useRouter } from 'next/router'
import Link from 'next/link'
import config from '../../config/index'
import clsx from 'clsx'
import { allAccountsAvatar } from '../homePage/address-views/utils/index'
import { subAppBaseUrl } from 'src/config/env'
import { useIdentitiesByAccounts, getSubsocialIdentity } from '../../rtk/features/identities/identitiesHooks'
import { toGenericAccountId } from 'src/rtk/app/util'

const { mobileAppLogo, appLogo } = config
import { useTranslation } from 'react-i18next'
import { useSidebarCollapsed } from '../providers/SideBarCollapsedContext'
import { AccountIdentities } from '../identity/types'
import { isEmptyArray } from '@subsocial/utils'
import { useMyAddress } from '../providers/MyExtensionAccountsContext'
import { useSendEvent } from '../providers/AnalyticContext'

type AccountPreviewProps = {
  address?: string
  withAddress?: boolean
  identities?: AccountIdentities
}

export const AccountPreview = ({ address, withAddress = false, identities }: AccountPreviewProps) => {
  const subsocialIdentity = getSubsocialIdentity(identities)

  const avatar = subsocialIdentity?.image

  return <span className={clsx('DfCurrentAddress icon')}>
    <div className='DfChooseAccount'>
      <div className='DfAddressIcon d-flex align-items-center'>
        <BaseAvatar address={address} avatar={avatar} />
      </div>
      <div className='DfAddressInfo ui--AddressComponents pt-0 pb-0 align-self-center'>
        {address && <Name address={address} identities={identities} className={styles.AccountName} />}
        {(withAddress && address) && <div className={`DfGreyLink ${styles.SwitchAccountAddress}`}>{toShortAddress(address)}</div>}
      </div>
    </div>
  </span>
}

type AllAccountMenuItem = {
  withDivider?: boolean
  onlyAvatar?: boolean
}

const AllAccountsMenuItem = ({ withDivider = false, onlyAvatar = false }: AllAccountMenuItem) => {
  const { t } = useTranslation()

  return (
    <>
      <span className={clsx({ ['DfCurrentAddress']: !onlyAvatar }, 'icon align-items-center')}>
        <div className={clsx('d-flex align-items-center')}>
          <BaseAvatar address={undefined} avatar={allAccountsAvatar} />
        </div>
        {!onlyAvatar && <div className='DfAddressInfo ui--AddressComponents pt-0 pb-0'>
          {t('general.allAccounts')}
        </div>}
      </span>
      {withDivider && <Divider className='m-0 bs-mt-2 bs-mb-2 ml-1' />}
    </>
  )
}

type MenuProps = {
  accounts?: InjectedAccount[]
  isSignIn: boolean
  hideSignInModal?: () => void
  closeDropdown?: () => void
}

export const DropdownItems = (props: MenuProps) => {
  const router = useRouter()
  const { pathname } = router
  const { t } = useTranslation()
  const { accounts, isSignIn, hideSignInModal, closeDropdown } = props
  const { setMyAddress, signOut, setIsMulti } = useMyExtensionAccount()
  const addressFromStorage = getAddressFromStorage()
  const sendEvent = useSendEvent()

  const addresses = accounts?.map(account => account.address)

  const identities = useIdentitiesByAccounts(addresses)

  const onItemClick = (item: any) => {
    const key = item.key

    if (key !== 'signOut') {
      sendEvent('switch_account')

      setMyAddress(key)
      setIsMulti(checkIsMulti(key))
      setAddressToStorage(key)

      if (pathname === '/') {
        router.replace(`/${key}`)
      } else {
        const query = { ...router.query, address: key }
        router.push({ pathname, query: query })
      }
    } else {
      sendEvent('sign_out')
      signOut()
      router.push('/', '')
    }

    hideSignInModal && hideSignInModal()
    closeDropdown && closeDropdown()
  }

  const showAllAccounts = accounts && accounts.length > 1

  const noAccountLabel = (
    <div className='mt-3 ml-2 text-left'>
      No accounts found or the source is not allowed to interact with this extension.
      Please open your Polkadot extension and create a new account or give access to this site.
    </div>
  )

  const menu = (
    <Menu mode='horizontal' className={styles.ChooseAccountMenu} onClick={onItemClick}>
      <Menu.ItemGroup>
        {accounts && accounts.length? <Menu.ItemGroup>
        {showAllAccounts &&
          <Menu.Item className={clsx(styles.AllAccountsItem)} key={addresses?.join(',')}>
            <AllAccountsMenuItem />
          </Menu.Item>}

        {showAllAccounts && <Divider className='m-0 bs-mt-2 bs-mb-2 ml-1' />}


        {accounts?.map(
          (account) =>
            account.address !== addressFromStorage && (
              <Menu.Item className={styles.MenuItem} key={account.address}>
                <AccountPreview
                  address={account.address}
                  withAddress identities={identities ? identities[toGenericAccountId(account.address)] : undefined}
                />
              </Menu.Item>
            )
        )}
        </Menu.ItemGroup> : <div className='ml-2 bs-mr-3 bs-mb-2'>{noAccountLabel}</div>}
        {isSignIn && getAddressFromStorage() && (
          <Menu.Item key='signOut' className={styles.MenuItem}>
            <Button type='primary' block ghost onClick={signOut}>
              {t('buttons.signOut')}
            </Button>
          </Menu.Item>
        )}
      </Menu.ItemGroup>
    </Menu>
  )


  return menu
}

const TopMenu = () => {
  const { openModal } = useMyExtensionAccount()
  const { t } = useTranslation()
  const accounts = useMyExtensionAddresses()
  const addresses = useMyAddresses()
  const myAddress = useMyAddress()
  const addressFromStorage = getAddressFromStorage()
  const identities = useIdentitiesByAccounts(addressFromStorage?.split(','))
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ show, setShow ] = useState(false)
  const { toggle, state: { collapsed } } = useSidebarCollapsed()
  const currentAddress = useCurrentAccount()
  const sendEvent = useSendEvent()

  const isMulti = checkIsMulti(addressFromStorage)

  const isSignIn = useIsSignedIn()
  const { isNotMobile, isMobile, isDesktop } = useResponsiveSize()

  if (!addresses && isSignIn) return null

  const address = !isMulti ? myAddress : undefined

  const accountIdentities = addressFromStorage && identities && !isMulti ? identities[addressFromStorage] : undefined

  const onClick = () => {
    sendEvent('click_on_the_sign_in_button_on_top_menu')
    openModal()
  }
  const subsocialIdentity = getSubsocialIdentity(accountIdentities)

  const showCreateProfile = addressFromStorage && !!accounts?.find(x => x.address === address) && !subsocialIdentity && !isMobile

  const homePageLink = addressFromStorage ? `/${addressFromStorage}` : '/'

  const createProfileButton = showCreateProfile && <Button
    type='primary'
    ghost
    className='bs-mr-3'
  >
    <ExternalLink url={`${subAppBaseUrl}/spaces/new`} value={t('buttons.createProfile')} />
  </Button>

  return (
    <>
      {isMobile && show ? (
        <div className='DfTopBar DfTopBar--search'>
          <SearchInput hideSearch={() => setShow(false)} isMulti={isMulti} />
          <Tooltip title={t('tooltip.closeSearchInput')} className='DfCloseSearchIcon'>
            <CloseCircleOutlined onClick={() => setShow(false)} />
          </Tooltip>
        </div>
      ) : (
        <div className='DfTopBar'>
          <div className='DfTopBar--leftContent'>
            {!isEmptyArray(currentAddress) && !isAccountsPage() && !isFavorites() && (collapsed
              ? <MenuOutlined style={{ fontSize: '20px' }} onClick={toggle} className={clsx('DfBurgerIcon mr-1', isDesktop && 'DfBurgerIconDesktop')} />
              : <CloseOutlined style={{ fontSize: '20px' }} onClick={toggle} className={clsx('DfBurgerIcon mr-1', isDesktop && 'DfBurgerIconDesktop')} />)}
            <Link href={homePageLink}>
              <a className='DfBrand mt-1'>
                <img src={!isMobile ? appLogo : mobileAppLogo} alt='SubId' />
              </a>
            </Link>
          </div>

          {isNotMobile && <SearchInput isMulti={isMulti} />}
          <div className='DfTopBar--rightContent'>
            {isMobile && (
              <Tooltip title={t('tooltip.openSearchInput')}>
                <SearchOutlined
                  className='DfSearchIcon DfHoverIcon'
                  onClick={() => setShow(true)}
                />
              </Tooltip>
            )}

            {createProfileButton}

            {addressFromStorage ? (
              <Dropdown
                trigger={[ 'click' ]}
                visible={visible}
                onVisibleChange={setVisible}
                placement='bottomRight'
                overlayClassName={styles.Dropdown}
                overlay={<DropdownItems
                  isSignIn={isSignIn}
                  accounts={accounts}
                  closeDropdown={() => setVisible(false)}
                />}
              >
                {!isMulti ? (
                  <div>
                    {!isMobile
                      ? <AccountPreview address={addressFromStorage} identities={accountIdentities} />
                      : <BaseAvatar address={addressFromStorage} avatar={subsocialIdentity?.image} />}
                  </div>
                ) : <div><AllAccountsMenuItem onlyAvatar={isMobile} /></div>}
              </Dropdown>
            ) : (
              <Button type='primary' ghost className='bs-ml-3' onClick={onClick}>
                {t('buttons.signIn')}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default TopMenu
