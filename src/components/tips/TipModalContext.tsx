import { createContext, useContext, useEffect, useState } from 'react'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { ChainInfo } from 'src/rtk/features/multiChainInfo/types'
import { convertAddressToChainFormat } from '../utils'
import { networkByCurrency } from './SupportedTokens'
import { fetchBalanceByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { useAppDispatch } from 'src/rtk/app/store'

type TipContextState = {
  sender?: string
  setSender: (s: string) => void
  currency?: string
  setCurrency: (s: string) => void
  success: boolean
  setSuccess: (a: boolean) => void
  infoByNetwork?: ChainInfo
  network?: string
  amount?: string
  setAmount: (s: string) => void
}

const TipContext = createContext<TipContextState>({} as any)

export const TipContextWrapper: React.FC = ({ children }) => {
  const dispatch = useAppDispatch()
  const [ sender, setSender ] = useState<string>()
  const [ currency, setCurrency ] = useState<string>()
  const [ success, setSuccess ] = useState(false)
  const [ amount, setAmount ] = useState<string>()

  const chainInfo = useChainInfo()
  const network = currency ? networkByCurrency[currency] : undefined
  const infoByNetwork = network ? chainInfo[network] : undefined

  const setSenderWithCorrectFormat = (account: string) => {
    setSender(convertAddressToChainFormat(account, infoByNetwork?.ss58Format) || account)
  }

  useEffect(() => {
    if (!sender || !infoByNetwork?.id) return
    fetchBalanceByNetwork(dispatch, [ sender ], infoByNetwork?.id)
  }, [ sender, infoByNetwork ])

  const value = {
    sender,
    setSender: setSenderWithCorrectFormat,
    currency,
    setCurrency,
    success,
    setSuccess,
    infoByNetwork,
    network,
    amount,
    setAmount
  }

  return <TipContext.Provider value={value}>
    {children}
  </TipContext.Provider>
}

export const useTipContext = () => useContext(TipContext)