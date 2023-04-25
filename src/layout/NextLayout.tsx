import React, { useEffect } from 'react'
import { Navigation } from './Navigation'
import { SidebarCollapsedProvider } from '../components/providers/SideBarCollapsedContext'
import { ResponsiveSizeProvider } from '../components/responsive/ResponsiveContext'
import ExtensionAccountProvider from '../components/providers/MyExtensionAccountsContext'
import { LazyConnectionsProvider } from 'src/components/lazy-connection/LazyConnectionContext'
import { ClaimCrowdloanProvider } from 'src/components/crowdloan/ClaimCrowdloanContext'
import { useAppDispatch } from '../rtk/app/store'
import { pricesActions } from '../rtk/features/prices/pricesSlice'
import { getChainsNamesForCoinGecko } from '../rtk/features/prices/pricesHooks'
import { useChainInfo } from '../rtk/features/multiChainInfo/multiChainInfoHooks'
import { MINUTES } from '../components/utils/index'
import ChatFloatingModal from 'src/components/chat/ChatFloatingModal'

const Page: React.FunctionComponent = ({ children }) => <>
  <>{children}</>
</>

const NextLayout: React.FunctionComponent = (props) => {
  const dispatch = useAppDispatch()
  const chainsInfo = useChainInfo()

  useEffect(() => {
    const fetchPrices = () => {
      dispatch(pricesActions.fetchPrices(getChainsNamesForCoinGecko(chainsInfo)))
    }

    fetchPrices()

    const key = setInterval(fetchPrices, 5 * MINUTES)

    return () => {
      key && clearInterval(key)
    }
  }, [])

  return (
    <ResponsiveSizeProvider>
      <ExtensionAccountProvider>
        <SidebarCollapsedProvider>
          <LazyConnectionsProvider>
            <ClaimCrowdloanProvider>
              <Navigation>
                <Page {...props} />
              </Navigation>
              <ChatFloatingModal />
            </ClaimCrowdloanProvider>
          </LazyConnectionsProvider>
        </SidebarCollapsedProvider>
      </ExtensionAccountProvider>
    </ResponsiveSizeProvider>
  )
}

export default NextLayout
