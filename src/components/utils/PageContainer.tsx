import React, { useEffect, FC,/* , useMemo */ } from 'react'
import {
  getAddressFromStorage } from '../utils/index'
import { PageContent } from './PageWrapper'
import {
  useIsSignedIn,
  useCurrentAccount
} from '../providers/MyExtensionAccountsContext'
import NoData from '../utils/EmptyList'
import { useRouter } from 'next/router'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { isValidAddresses, isValidAddress, parseAddressFromUrl } from './index'
import dynamic from 'next/dynamic'
import { useResponsiveSize } from '../responsive/ResponsiveContext'

const AccountInfo = dynamic(() => import('../homePage/AccountInfo'), { ssr: false })
const Footer = dynamic(() => import('../footer/Footer'), { ssr: false })
const OnlySearch = dynamic(() => import('../onlySearch/OnlySearch'), { ssr: false })
// const ProposalBanner = dynamic(import('./banners/ProposalBanner/index'), { ssr: false })

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

  const isSignIn = useIsSignedIn()

  useEffect(() => {
    const addressFromPath = asPath.split('/').pop()

    if (asPath.includes('#') && addressFromPath && isValidAddress(addressFromPath)) {
        addressFromPath && replace('/[address]', addressFromPath)
    } else {
      if (isSignIn && !addressFromUrl && addressFromStorage) replace(addressFromStorage)
    }

  }, [ addressFromStorage, isSignIn ])

  // const banner = useMemo(() => <ProposalBanner />, [])
    
  if (isEmptyArray(parsedAddressFromUrl) && (!isServerSide && !isSignIn)) return <>
    <div className='layout-wrapper'>
      <OnlySearch />
    </div>
    <Footer />
  </>


  return <>
    <div className='layout-wrapper'>
      <PageContent>
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
