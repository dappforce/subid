import React from 'react'
import LazyTxButton, { TxButtonProps } from '../../lazy-connection/LazyTxButton'
import { FN } from '@polkawallet/bridge/types'
import { getCrossChainAdapter } from '../configs/cross-chain'

type CrossChainTransferParam = {
  amount: string
  token: string
  destChain: string
  recipient: string
}
export type CrossChainTransferButtonProps = Omit<TxButtonProps, 'params' | 'extrinsic' | 'customTxBuilder'> & {
  crossChainParam: () => CrossChainTransferParam | Promise<CrossChainTransferParam>
}

export default function CrossChainTransferButton ({ crossChainParam, ...props }: CrossChainTransferButtonProps) {
  const txBuilder: TxButtonProps['customTxBuilder'] = async (api, signer, address) => {
    const { amount, destChain, recipient, token } = await crossChainParam()
    const adapter = getCrossChainAdapter(props.network)
    
    if (!adapter) throw new Error(`Adapter ${props.network} not found`)

    await adapter.init(api as any)


    const tx = adapter.createTx({
      amount: FN.fromInner(amount, 10),
      to: destChain as any,
      token,
      address: recipient,
      signer: address
    })


    const signedTx = await tx.signAsync(address, { signer: signer as any })
    return signedTx as any
  }
  return (
    <LazyTxButton customTxBuilder={txBuilder} {...props} />
  )
}
