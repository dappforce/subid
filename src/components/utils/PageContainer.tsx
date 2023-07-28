import React, { useEffect, FC/* , useMemo */ } from 'react'
import {
  getAddressFromStorage } from '../utils/index'
import { PageContent, HeadMeta } from './PageWrapper'
import {
  useIsSignedIn,
  useCurrentAccount
} from '../providers/MyExtensionAccountsContext'
import NoData from '../utils/EmptyList'
import { resolveUrlWithAddress } from '../utils/index'
import { useRouter } from 'next/router'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { toGenericAccountId } from '../../rtk/app/util'
import { isValidAddresses, isValidAddress, parseAddressFromUrl } from './index'
import { useIsMulti } from '../providers/MyExtensionAccountsContext'
import { useIdentitiesByAccounts, getSubsocialIdentity } from '../../rtk/features/identities/identitiesHooks'
import dynamic from 'next/dynamic'
import { useResponsiveSize } from '../responsive/ResponsiveContext'

const AccountInfo = dynamic(() => import('../homePage/OverviewPage'), { ssr: false })
const Footer = dynamic(() => import('../footer/Footer'), { ssr: false })
const OnlySearch = dynamic(() => import('../onlySearch/OnlySearch'), { ssr: false })
// const DomainsBanner = dynamic(import('./banners/ProposalBanner/index'), { ssr: false })

type PageContainerProps = {
  isHomePage?: boolean
}

const PageContainer: FC<PageContainerProps> = ({ children, isHomePage }) => {
  const addressFromStorage = getAddressFromStorage()
  const { query, replace, asPath } = useRouter()
  const { address: maybeAddress } = query
  const { isMobile } = useResponsiveSize()

  const addressFromUrl = maybeAddress?.toString()
  const parsedAddressFromUrl = parseAddressFromUrl(addressFromUrl)

  const addresses = (useCurrentAccount() || parsedAddressFromUrl).filter(x => isDef(x) && !!x)

  const isServerSide = typeof window === 'undefined'

  const isValid = isValidAddresses(addresses)
  const isMulti = useIsMulti()

  const identities = useIdentitiesByAccounts(addresses)

  const isSignIn = useIsSignedIn()

  useEffect(() => {
    const addressFromPath = asPath.split('/').pop()

    if (asPath.includes('#') && addressFromPath && isValidAddress(addressFromPath)) {
        addressFromPath && replace('/[address]', addressFromPath)
    } else {
      if (isSignIn && !addressFromUrl && addressFromStorage) replace(addressFromStorage)
    }

  }, [ addressFromStorage, isSignIn ])

  // const banner = useMemo(() => <DomainsBanner />, [])
    
  if (isEmptyArray(parsedAddressFromUrl) && (!isServerSide && !isSignIn)) return <>
    <HeadMeta title='' />

    <div className='layout-wrapper'>
      <OnlySearch />
    </div>
    <Footer />
  </>


  const address = !isMulti ? addresses[addresses.length - 1] : undefined

  const identity = address && identities ? identities[toGenericAccountId(address)] : undefined

  const owner = getSubsocialIdentity(identity)

  const { name, image } = owner || {}

  return <>
    <div className='layout-wrapper'>
      <PageContent
        meta={{
          title: name || '',
          image: image,
          canonical: resolveUrlWithAddress(address || '')
        }}
      >
        {!isValid && !isServerSide && asPath !== '/' && !asPath.includes('#')
          ? <NoData description='Address is not valid' />
          : <>
            {/* {isHomePage && banner} */}
            <AccountInfo
              addresses={addresses}
              addressFromStorage={addressFromStorage}
              size={isMobile ? 60 : 90}
              isHomePage={isHomePage}
            />
            {children}
          </>}
      </PageContent>
    </div>
    <Footer />
  </>
}

export default PageContainer
