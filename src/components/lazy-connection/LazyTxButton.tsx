import React, { useState } from 'react'
import { ButtonProps, Button } from 'antd'

import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { SubmittableResult } from '@polkadot/api'
import { isFunction } from '@polkadot/util'
import type { Signer } from '@polkadot/api/types'

import { ApiPromise } from '@polkadot/api'

import { newLogger, isEmptyStr } from '@subsocial/utils'
import { Message, showSuccessMessage, showErrorMessage, controlledMessage } from '../utils/Message'
import { VoidFn } from '@polkadot/api/types'
import { LoadingOutlined } from '@ant-design/icons'

import { AnyAccountId } from '@subsocial/types'
import { useLazyConnectionsContext } from './LazyConnectionContext'
import { getWalletBySource } from '../wallets/supportedWallets/index'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { getCurrentWallet } from '../utils/index'
import { DAPP_NAME } from '../providers/utils'
const log = newLogger('TxButton')

export type GetTxParamsFn = () => any[]
export type GetTxParamsAsyncFn = () => Promise<any[]>

export type TxCallback = (status: SubmittableResult) => void
export type TxFailedCallback = (status: SubmittableResult | null) => void

type SuccessMessageFn = (status: SubmittableResult) => Message
type FailedMessageFn = (status: SubmittableResult | null) => Message

type SuccessMessage = Message | SuccessMessageFn
type FailedMessage = Message | FailedMessageFn

export type BaseTxButtonProps = Omit<ButtonProps, 'onClick' | 'form'>

export type TxButtonProps = BaseTxButtonProps & {
  accountId?: AnyAccountId
  network: string // TODO: make type
  customTxBuilder?: (api: ApiPromise, signer: Signer, address: string) => SubmittableExtrinsic | Promise<SubmittableExtrinsic>
  tx?: string
  params?: any[] | GetTxParamsFn | GetTxParamsAsyncFn
  label?: React.ReactNode
  title?: string
  unsigned?: boolean
  onValidate?: () => boolean | Promise<boolean>
  onClick?: () => void
  onSuccess?: TxCallback
  onFailed?: TxFailedCallback
  successMessage?: SuccessMessage
  failedMessage?: FailedMessage
  withSpinner?: boolean
  component?: React.FunctionComponent
  customNodeApi?: ApiPromise
}

export const getExtrinsicByApi = async (
  api: ApiPromise, 
  tx?: string, 
  params?: any[] | GetTxParamsFn | GetTxParamsAsyncFn
): Promise<SubmittableExtrinsic> => {
  const [ pallet, method ] = (tx || '').split('.')

  if (!api.tx[pallet]) {
    throw new Error(`Unable to find api.tx.${pallet}`)
  } else if (!api.tx[pallet][method]) {
    throw new Error(`Unable to find api.tx.${pallet}.${method}`)
  }

  let resultParams = (params || []) as any[]
  if (isFunction(params)) {
    resultParams = await params()
  }

  return api.tx[pallet][method](...(resultParams))
}

function LazyTxButton ({
  accountId,
  network,
  tx,
  params,
  customTxBuilder,
  label,
  disabled,
  unsigned,
  onValidate,
  onClick,
  onSuccess,
  onFailed,
  successMessage,
  failedMessage,
  withSpinner = true,
  component,
  children,
  ...antdProps
}: TxButtonProps) {
  const [ isSending, setIsSending ] = useState(false)
  const { isMobile } = useResponsiveSize()
  const { getApiByNetwork } = useLazyConnectionsContext()

  const waitMessage = controlledMessage({
    message: 'Waiting for transaction',
    type: 'info',
    duration: 0,
    icon: <LoadingOutlined />
  })

  let unsub: VoidFn | undefined

  const buttonLabel = label || children
  const Component = component || Button

  const getExtrinsic = async (): Promise<SubmittableExtrinsic> => {
    const api = await getApiByNetwork(network)
    
    return getExtrinsicByApi(api, tx, params)
  }

  const doOnSuccess: TxCallback = (result) => {
    isFunction(onSuccess) && onSuccess(result)

    const message: Message = isFunction(successMessage)
      ? successMessage(result)
      : successMessage

    message && showSuccessMessage(message)
  }

  const doOnFailed: TxFailedCallback = (result) => {
    isFunction(onFailed) && onFailed(result)

    const message: Message = isFunction(failedMessage)
      ? failedMessage(result)
      : failedMessage

    message && showErrorMessage(message)
  }

  const onSuccessHandler = async (result: SubmittableResult) => {

    if (!result || !result.status) {
      return
    }

    const { status } = result
    // TODO show antd success notification here
    if (status.isFinalized || status.isInBlock) {
      setIsSending(false)
      await unsubscribe()

      const blockHash = status.isFinalized
        ? status.asFinalized
        : status.asInBlock

      log.debug(`✅ Tx finalized. Block hash: ${blockHash.toString()}`)

      result.events
        .filter(({ event: { section } }): boolean => section === 'system')
        .forEach(({ event: { method } }): void => {
          if (method === 'ExtrinsicSuccess') {
            doOnSuccess(result)
          } else if (method === 'ExtrinsicFailed') {
            doOnFailed(result)
          }
        })
    } else if (result.isError) {
      doOnFailed(result)
    } else {
      log.debug(`⏱ Current tx status: ${status.type}`)
    }

  }

  const onFailedHandler = (err: Error) => {
    setIsSending(false)

    if (err) {
      const errMsg = `Tx failed: ${err.toString()}`
      log.debug(`❌ ${errMsg}`)
      showErrorMessage(errMsg)
    }

    doOnFailed(null)
  }

  const sendSignedTx = async () => {
    if (!accountId) {
      throw new Error('No account id provided')
    }

    let signer: Signer | undefined

    if (isMobile) {
      const { web3FromAddress, web3Enable } = await import('@polkadot/extension-dapp')
      await web3Enable(DAPP_NAME)
      signer = await (await web3FromAddress(accountId.toString())).signer
    } else {
      const currentWallet = getCurrentWallet()
      const wallet = getWalletBySource(currentWallet)
      signer = wallet?.signer
    }

    if (!signer) {
      throw new Error('No signer provided')
    }

    try {
      let tx: SubmittableExtrinsic
      if (customTxBuilder) {
        const api = await getApiByNetwork(network)
        tx = await customTxBuilder(api, signer, accountId.toString())
      } else {
        const extrinsic = await getExtrinsic()
        tx = await extrinsic.signAsync(accountId.toString(), { signer })
      }
      unsub = await tx.send(onSuccessHandler)
      waitMessage.open()
    } catch (err: any) {
      onFailedHandler(err)
    }
  }

  const sendUnsignedTx = async () => {
    const extrinsic = await getExtrinsic()

    try {
      unsub = await extrinsic.send(onSuccessHandler)
      waitMessage.open()
    } catch (err: any) {
      onFailedHandler(err)
    }
  }

  const unsubscribe = () => {
    if (unsub) {
      waitMessage.close()
      unsub()
    }
  }

  // TODO can optimize this fn by wrapping it with useCallback. See TxButton from Apps.
  const sendTx = async () => {
    unsubscribe()


    if (isFunction(onValidate) && !(await onValidate())) {
      log.warn('Cannot send a tx because onValidate() returned false')
      return
    }

    isFunction(onClick) && onClick()

    const txType = unsigned ? 'unsigned' : 'signed'
    log.debug(`Sending ${txType} tx...`)

    setIsSending(true)

    if (unsigned) {
      sendUnsignedTx()
    } else {
      sendSignedTx()
    }
  }

  const isDisabled =
    disabled ||
    isSending ||
    (isEmptyStr(tx) && !customTxBuilder)

  return (
    <Component
      {...antdProps}
      onClick={sendTx}
      disabled={isDisabled || isSending}
      loading={withSpinner && isSending}
    >
      {buttonLabel}
    </Component>
  )
}

export default React.memo(LazyTxButton)
