import { useContext, createContext, useState } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { controlledMessage } from '../utils/Message'
import { LoadingOutlined } from '@ant-design/icons'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'

type LazyConnectionsContextType = {
  getApiByNetwork: (network: string) => Promise<ApiPromise>
  isConnecting: boolean
}

const contextStub: LazyConnectionsContextType = {
  getApiByNetwork: {} as any,
  isConnecting: false
}
const connections: Record<string, ApiPromise> = {}

export const LazyConnectionsContext = createContext<LazyConnectionsContextType>(contextStub)

export function LazyConnectionsProvider (props: React.PropsWithChildren<{}>) {
  const chainInfo = useChainInfo()
  const [ isConnecting, setIsConnecting ] = useState<boolean>(false)

  const waitMessage = controlledMessage({
    message: 'Waiting for connection',
    type: 'info',
    duration: 0,
    icon: <LoadingOutlined />
  })

  const getApiByNetwork = async (network: string) => {
    let api = connections[network]

    if (api) return api

    waitMessage.open()
    setIsConnecting(true)
    const { node, wsNode } = chainInfo[network]

    const provider = new WsProvider(wsNode || node)
    api = new ApiPromise({ provider } as any)
    connections[network] = await api.isReady
    waitMessage.close()
    setIsConnecting(false)

    return api
  }

  const value: LazyConnectionsContextType = {
    getApiByNetwork,
    isConnecting
  }

  return <LazyConnectionsContext.Provider value={value}>{props.children}</LazyConnectionsContext.Provider>
}

export function useLazyConnectionsContext () {
  return useContext(LazyConnectionsContext)
}