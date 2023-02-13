import { useEffect, useState } from 'react'
import { useLazyConnectionsContext } from '../../lazy-connection/LazyConnectionContext'
import { getExtrinsicByApi, GetTxParamsAsyncFn, GetTxParamsFn } from '../../lazy-connection/LazyTxButton'
import { useMyAddress } from '../../providers/MyExtensionAccountsContext'
import { useChainInfo } from '../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { convertToBalanceWithDecimal } from '../../common/balances/utils'
import { BalanceView } from '../../homePage/address-views/utils/index'
import { getTokenDecimals, getTokenSymbol } from '../../utils/index'

type TxFeeProps = {
  network: string
  tx?: string 
  params?: any[] | GetTxParamsFn | GetTxParamsAsyncFn
  className?: string
}

export const TxFee = ({ network, tx, params, className }: TxFeeProps) => {
  const myAddress = useMyAddress()
  const { getApiByNetwork } = useLazyConnectionsContext()
  const [ feeValue, setFeeValue ] = useState('')
  const chainsInfo = useChainInfo()

  useEffect(() => {
    if(!myAddress) return

    const getFee = async () => {
      const api = await getApiByNetwork(network)

      const extrinsic = await getExtrinsicByApi(api, tx, params)
      const { partialFee } = await extrinsic.paymentInfo(myAddress)

      setFeeValue(partialFee.toString())
    }

    getFee()

  }, [ myAddress, params ])

  const decimals = getTokenDecimals(network, chainsInfo)
  const symbol = getTokenSymbol(network, chainsInfo)

  const feeWithDecimals = convertToBalanceWithDecimal(feeValue, decimals)

  const fee = <BalanceView value={feeWithDecimals} symbol={symbol} className={className} />

  return feeValue ? fee : <div className={className}>-</div>
}