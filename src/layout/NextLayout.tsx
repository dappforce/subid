import React, { useEffect } from 'react'
import { SidebarCollapsedProvider } from '../components/providers/SideBarCollapsedContext'
import { ResponsiveSizeProvider } from '../components/responsive/ResponsiveContext'
import ExtensionAccountProvider from '../components/providers/MyExtensionAccountsContext'
import { LazyConnectionsProvider } from 'src/components/lazy-connection/LazyConnectionContext'
import { ClaimCrowdloanProvider } from 'src/components/crowdloan/ClaimCrowdloanContext'
import { useAppDispatch } from '../rtk/app/store'
import { pricesActions } from '../rtk/features/prices/pricesSlice'
import { getChainsNamesForCoinGecko } from '../rtk/features/prices/pricesHooks'
import { useChainInfo } from '../rtk/features/multiChainInfo/multiChainInfoHooks'
import { MINUTES, isCreatorStakingPage } from '../components/utils/index'
import dynamic from 'next/dynamic'
import AnalyticProvider from 'src/components/providers/AnalyticContext'
import { ChatContextWrapper } from 'src/components/providers/ChatContext'
import { ConfigProvider } from 'antd'
import theme from './themeConfig'

const Navigation = dynamic(() => import('./Navigation'), { ssr: false })
const ChatFloatingModal = dynamic(() => import('src/components/chat/ChatFloatingModal'), {
  ssr: false
})

const Page: React.FunctionComponent = ({ children }) => (
  <>
    <>{children}</>
  </>
)

const NextLayout: React.FunctionComponent = (props) => {
  const dispatch = useAppDispatch()
  const chainsInfo = useChainInfo()

  useEffect(() => {
    const fetchPrices = () => {
      dispatch(
        pricesActions.fetchPrices(getChainsNamesForCoinGecko(chainsInfo))
      )
    }

    fetchPrices()

    const key = setInterval(fetchPrices, 5 * MINUTES)

    return () => {
      key && clearInterval(key)
    }
  }, [])

  return (
    <ConfigProvider theme={theme}>
      <ResponsiveSizeProvider>
        <AnalyticProvider>
          <ExtensionAccountProvider>
            <SidebarCollapsedProvider>
              <LazyConnectionsProvider>
                <ClaimCrowdloanProvider>
                  <ChatContextWrapper>
                    <Navigation>
                      <Page {...props} />
                    </Navigation>
                    <ChatFloatingModal
                      position={isCreatorStakingPage() ? 'right' : 'bottom'}
                    />
                  </ChatContextWrapper>
                </ClaimCrowdloanProvider>
              </LazyConnectionsProvider>
            </SidebarCollapsedProvider>
          </ExtensionAccountProvider>
        </AnalyticProvider>
      </ResponsiveSizeProvider>
    </ConfigProvider>
  )
}

export default NextLayout
