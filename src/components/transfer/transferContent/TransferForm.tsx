import { Form, FormProps } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import FormSubmitButton from '../../utils/FormSubmitButton'
import {
  TokenAmountFormItem,
  TokenAmountFormItemProps,
} from '../form-items/TokenAmountFormItem'
import TokenBalanceView from './TokenBalanceView'
import TokenSelector, {
  TokenData,
  tokenSelectorEncoder,
} from '../form-items/TokenSelector'
import clsx from 'clsx'
import LazyTxButton, { TxButtonProps } from '../../lazy-connection/LazyTxButton'
import { useMyAddress } from '../../providers/MyExtensionAccountsContext'
import { useAppDispatch } from 'src/rtk/app/store'
import {
  fetchBalanceByNetwork,
  useFetchBalanceByNetwork,
} from 'src/rtk/features/balances/balancesHooks'
import CrossChainRouteSelector, {
  setCrossChainRouteValue,
} from '../cross-chain/CrossChainRouteSelector'
import CrossChainTransferButton, {
  CrossChainTransferButtonProps,
} from '../cross-chain/CrossChainTransferButton'
import { checkSameAttributesValues } from '../../utils'
import RecipientInput from '../form-items/RecipientInput'
import { isTokenBridgeable } from '../configs/cross-chain'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { useIsMobileWidthOrDevice } from '../../responsive'
import { useTranslation } from 'react-i18next'
import { toGenericAccountId } from 'src/rtk/app/util'
import { CrossChainFee, TransferFee } from './TransferFee'
import {
  TransferFormData,
  getCrossChainFee,
  getDefaultSelectorOption,
  getTransferFormData,
  transferFormField,
} from '../utils'
import { useTransferTxBuilder } from '../hooks/useTransferTxBuilder'
import { useSendEvent } from '../../providers/AnalyticContext'
import useGetTokensOptions from '../hooks/useGetTokensOptions'
import { useRouter } from 'next/router'

export type ExtendedTransferFormData = TransferFormData & {
  sourceChainName: string
  destChainName?: string
  sender: string
}
export type TransferFormDefaultToken = {
  token: string
  network?: string
  tokenId?: { id: any }
}
export type TransferFormProps = Omit<FormProps, 'form' | 'children'> & {
  defaultRecipient?: string
  crossChain?: boolean
  defaultSelectedToken?: TransferFormDefaultToken
  onTransferClick?: (param: ExtendedTransferFormData) => void
  onTransferSuccess?: (param: ExtendedTransferFormData) => void
  onTransferFailed?: () => void
  isModalVisible?: boolean
  isModal?: boolean
  dest?: string
  defaultAmount?: string
  children?: (
    formSection: JSX.Element,
    buttonSection: JSX.Element
  ) => JSX.Element
}

export const DEFAULT_TOKEN = {
  network: 'polkadot',
  token: 'DOT',
}
type SelectedTokenChainData = TokenData & {
  dest?: string
}
export default function TransferForm ({
  defaultSelectedToken = DEFAULT_TOKEN,
  defaultRecipient,
  crossChain,
  onTransferClick,
  onTransferSuccess,
  onTransferFailed,
  isModal = false,
  isModalVisible,
  dest,
  children,
  defaultAmount,
  ...props
}: TransferFormProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const isMobile = useIsMobileWidthOrDevice()
  const submittedData = useRef<ExtendedTransferFormData | null>(null)
  const chainsInfo = useChainInfo()
  const sendEvent = useSendEvent()
  const router = useRouter()

  const tokensOptions = useGetTokensOptions()

  const myAddress = useMyAddress()

  const [ form ] = Form.useForm()
  const [ selectedToken, setSelectedToken ] = useState<SelectedTokenChainData>({
    network: '',
    token: '',
  })

  useFetchBalanceByNetwork({
    network: selectedToken.network || '',
    address: myAddress,
    reload: false,
    trigger: !isModal && isModalVisible,
  })

  const {
    getSameChainTransferExtrinsic,
    crossChainParamBuilder,
    sameChainParamBuilder,
  } = useTransferTxBuilder(
    selectedToken.network ?? '',
    selectedToken.token,
    (crossChain) => getTransferFormData(form, crossChain)
  )

  useEffect(() => {
    const { token, tokenId, sourceChain, destChain, recipient } =
      getTransferFormData(form, !!crossChain)
    setSelectedToken({
      token,
      tokenId,
      network: sourceChain,
      dest: destChain,
    })

    if (crossChain && !recipient) {
      form.setFieldsValue({ [transferFormField('recipient')]: myAddress })
      form.validateFields([ transferFormField('recipient') ])
    } else if (!crossChain) {
      const isMyAddress =
        toGenericAccountId(myAddress) === toGenericAccountId(recipient)
      if (isMyAddress) {
        form.setFieldsValue({ [transferFormField('recipient')]: '' })
        form.validateFields([ transferFormField('recipient') ])
      }
    }
  }, [ crossChain ])

  const resetForm = useCallback(() => {
    if (!defaultSelectedToken) return
    form.resetFields()

    const selectedTokenFromSelectorOptions = !isModal
      ? getDefaultSelectorOption(
          tokensOptions,
          defaultSelectedToken,
          crossChain
        )
      : defaultSelectedToken

    form.setFieldsValue({
      [transferFormField('token')]: tokenSelectorEncoder.encode(
        selectedTokenFromSelectorOptions
      ),
      [transferFormField('recipient')]: defaultRecipient,
    })

    let crossChainToken = selectedTokenFromSelectorOptions.token
    let crossChainNetworkSource = selectedTokenFromSelectorOptions.network

    if (!isTokenBridgeable(selectedTokenFromSelectorOptions.token)) {
      crossChainToken = DEFAULT_TOKEN.token
      crossChainNetworkSource = DEFAULT_TOKEN.network
    }
    form.setFieldsValue({
      [transferFormField('crossChainToken')]: tokenSelectorEncoder.encode({
        token: crossChainToken,
      }),
    })
    setCrossChainRouteValue(
      form,
      transferFormField('source'),
      crossChainNetworkSource ?? '',
      'source',
      { token: crossChainToken }
    )

    if (dest) {
      const routeValueSet = setCrossChainRouteValue(
        form,
        transferFormField('dest'),
        dest ?? '',
        'dest',
        { token: crossChainToken }
      )

      if (!routeValueSet) {
        delete router.query.to
      }
    }

    if (crossChain) {
      setSelectedToken({
        token: crossChainToken,
        network: crossChainNetworkSource,
      })
    } else {
      setSelectedToken(selectedTokenFromSelectorOptions)
    }

    if (!isModal) {
      if (!crossChain) {
        delete router.query.to
      }

      const newQuery = {
        ...router.query,
        transferType: !crossChain ? 'same' : 'cross',
        asset: selectedTokenFromSelectorOptions.token,
        from: selectedTokenFromSelectorOptions?.network || undefined,
      }

      if (!selectedTokenFromSelectorOptions.network) {
        delete newQuery.from
      }

      router.replace({
        pathname: router.pathname,
        query: newQuery,
      })
    }
  }, [
    tokensOptions.join(','),
    crossChain,
    defaultSelectedToken.network,
    defaultSelectedToken.token,
  ])

  useEffect(() => {
    resetForm()
  }, [ resetForm ])

  const onTokenChange = (token: string) => {
    form.setFieldsValue({ token })
    const decodedToken = tokenSelectorEncoder.decode(token)

    !isModal &&
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          asset: decodedToken.token,
          from: decodedToken.network,
        },
      })

    setSelectedToken(decodedToken)
  }

  const onCrossChainTokenChange = (token: string) => {
    if (selectedToken.token === token) return
    form.setFieldsValue({
      [transferFormField('crossChainToken')]: token,
      [transferFormField('source')]: undefined,
      [transferFormField('dest')]: undefined,
    })

    const decodedToken = tokenSelectorEncoder.decode(token)

    !isModal &&
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          asset: decodedToken.token,
          from: decodedToken.network,
        },
      })

    setSelectedToken({
      token: decodedToken.token,
    })
  }

  const getExtendedTransferData = (): ExtendedTransferFormData => {
    const transferData = getTransferFormData(form, !!crossChain)
    const sourceChainInfo = chainsInfo[transferData.sourceChain]
    const destChainInfo = chainsInfo[transferData.destChain ?? '']
    return {
      ...transferData,
      sender: myAddress || '',
      sourceChainName: sourceChainInfo?.name,
      destChainName: destChainInfo?.name,
    }
  }

  const onClick = () => {
    const data = getExtendedTransferData()
    onTransferClick?.(data)
    submittedData.current = data

    sendEvent('transfer_sent', {
      type: data.destChain ? 'cross_chain' : 'same_chain',
      token: data.token,
    })
  }

  const onSuccess = () => {
    onTransferSuccess?.(getExtendedTransferData())
    resetForm()

    sendEvent('transfer_success')

    if (!myAddress || !submittedData.current) return
    const { sourceChain, destChain, recipient, sender } = submittedData.current
    if (sourceChain) {
      fetchBalanceByNetwork(dispatch, [ sender ], sourceChain)
    }
    if (destChain) {
      const WAIT_TIME = 30 * 1000 // 30 seconds
      setTimeout(() => {
        fetchBalanceByNetwork(dispatch, [ recipient ], destChain)
      }, WAIT_TIME)
    }
  }

  type TokenAmountPropsSubset = Pick<
    TokenAmountFormItemProps,
    'getCrossChainFee' | 'getDestChain' | 'getSourceChain' | 'getToken'
  >
  const tokenAmountProps: TokenAmountPropsSubset = {
    getSourceChain: () => getTransferFormData(form, !!crossChain).sourceChain,
    getToken: () => getTransferFormData(form, !!crossChain).token,
    getDestChain: () => getTransferFormData(form, !!crossChain).destChain,
    getCrossChainFee: () => getCrossChainFee(form).balance,
  }

  const requiredTouchedFields = [ transferFormField('amount') ]
  if (crossChain) {
    requiredTouchedFields.push(
      transferFormField('source'),
      transferFormField('dest')
    )
  } else {
    requiredTouchedFields.push(transferFormField('recipient'))
  }

  const onSourceChainChange = (source: string) => {
    !isModal &&
      router.replace({
        pathname: router.pathname,
        query: { ...router.query, from: source },
      })

    setSelectedToken((prev) => ({ ...prev, network: source }))
  }

  const onDestChainChange = (dest: string) => {
    !isModal &&
      router.replace({
        pathname: router.pathname,
        query: { ...router.query, to: dest },
      })
    setSelectedToken((prev) => ({ ...prev, dest }))
  }

  const formSection = (
    <div className={clsx('ant-form ant-form-vertical')}>
      <div
        className={clsx(
          'd-flex justify-content-between align-items-center',
          isMobile && 'flex-column align-items-center',
          'bs-mt-2 GapMini'
        )}
      >
        <Form.Item
          name={transferFormField(crossChain ? 'crossChainToken' : 'token')}
          className='m-0'
        >
          <TokenSelector
            setValue={crossChain ? onCrossChainTokenChange : onTokenChange}
            filterCrossChainBridgeable={crossChain}
            showNetwork={!crossChain}
            isModal={isModal}
          />
        </Form.Item>
        <TokenBalanceView
          label={`${t('transfer.transferableBalance')}:`}
          network={selectedToken.network}
          token={selectedToken.token}
        />
      </div>
      <div
        className={clsx('pb-2 d-flex flex-column', isMobile ? 'mt-3' : 'mt-4')}
      >
        <TokenAmountFormItem
          form={form}
          name={transferFormField('amount')}
          label={t('transfer.amount')}
          defaultAmount={defaultAmount}
          inputProps={{
            size: 'large',
            placeholder: t('transfer.placeholders.amount'),
          }}
          {...tokenAmountProps}
        />
        {crossChain && (
          <CrossChainRouteSelector
            decodeToken
            className='bs-mb-4'
            form={form}
            isModal={isModal}
            tokenFieldName={transferFormField('crossChainToken')}
            destChainFieldName={transferFormField('dest')}
            sourceChainFieldName={transferFormField('source')}
            onSourceChainChange={onSourceChainChange}
            onDestChainChange={onDestChainChange}
          />
        )}
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) =>
            !checkSameAttributesValues(prev, curr, [
              transferFormField('dest'),
              transferFormField('token'),
            ])
          }
        >
          {({ getFieldsValue }) => {
            const { destChain, sourceChain } = getTransferFormData(
              { getFieldsValue },
              !!crossChain
            )
            return (
              <RecipientInput
                name={transferFormField('recipient')}
                disableTransferToSelf={!crossChain}
                destChain={destChain || sourceChain}
                form={form}
                isModal={isModal}
              />
            )
          }}
        </Form.Item>
      </div>
    </div>
  )

  const buttonSection = (
    <div className='mt-auto'>
      <Form.Item shouldUpdate noStyle>
        {() => {
          if (!crossChain) return null
          const fee = getCrossChainFee(form)

          if (!fee.balance) return null
          return (
            <CrossChainFee
              className='bs-mb-2'
              amount={fee.balance}
              token={fee.token}
            />
          )
        }}
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {() => {
          const { sourceChain, token, destChain } = getTransferFormData(
            form,
            !!crossChain
          )
          return (
            <TransferFee
              className='bs-mb-3'
              token={token}
              dest={destChain}
              source={sourceChain}
            />
          )
        }}
      </Form.Item>
      <FormSubmitButton
        key={crossChain + ''}
        requiredTouchedFields={requiredTouchedFields}
      >
        {(disabled) => {
          const { sourceChain } = getTransferFormData(form, !!crossChain)

          const commonButtonProps: TxButtonProps &
            Omit<CrossChainTransferButtonProps, 'crossChainParam'> = {
            block: true,
            type: 'primary',
            size: 'large',
            onSuccess,
            network: sourceChain,
            accountId: myAddress,
            disabled,
            children: t('transfer.transfer'),
            failedMessage: (failedExtrinsic) =>
              failedExtrinsic && t('transfer.errors.transferFail'),
            onFailed: onTransferFailed,
            onClick,
          }

          if (crossChain) {
            return (
              <CrossChainTransferButton
                {...commonButtonProps}
                crossChainParam={crossChainParamBuilder}
              />
            )
          }

          return (
            <LazyTxButton
              {...commonButtonProps}
              tx={getSameChainTransferExtrinsic()?.split('(')?.[0]}
              params={sameChainParamBuilder}
            />
          )
        }}
      </FormSubmitButton>
    </div>
  )

  return (
    <Form form={form} {...props} className={clsx('w-100', props.className)}>
      {children ? (
        children(formSection, buttonSection)
      ) : (
        <>
          {formSection}
          {buttonSection}
        </>
      )}
    </Form>
  )
}
