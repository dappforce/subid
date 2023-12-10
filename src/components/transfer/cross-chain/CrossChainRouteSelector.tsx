import { Button, Form, FormInstance } from 'antd'
import React, { HTMLProps, useEffect } from 'react'
import TransferChainSelectorFormItem from '../form-items/TransferChainSelectorFormItem'
import { MutedDiv } from '../../utils/MutedText'
import { BsArrowLeftRight } from 'react-icons/bs'
import clsx from 'clsx'
import { getRouteOptions } from '../configs/cross-chain'
import { RouterFilter } from '@polkawallet/bridge'
import { tokenSelectorEncoder } from '../TokenSelector'
import { checkSameAttributesValues } from 'src/components/utils'
import { showWarnMessage } from '../../utils/Message'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

export type CrossChainRouteSelectorProps = Omit<
  HTMLProps<HTMLDivElement>,
  'form'
> & {
  form: FormInstance
  sourceChainFieldName: string
  destChainFieldName: string
  tokenFieldName: string
  decodeToken?: boolean
  onSourceChainChange?: (sourceChain: string) => void
  onDestChainChange?: (destChain: string) => void
}

export default function CrossChainRouteSelector (props: CrossChainRouteSelectorProps) {
  const { tokenFieldName, destChainFieldName, sourceChainFieldName, decodeToken } = props
  const dependencies = [ destChainFieldName, sourceChainFieldName, tokenFieldName ]
  return (
    <Form.Item
      shouldUpdate={(prev, curr) => !checkSameAttributesValues(prev, curr, dependencies)}
      noStyle
    >
      {({ getFieldValue }) => {
        let tokenData = getFieldValue(tokenFieldName)
        if (decodeToken) {
          tokenData = tokenSelectorEncoder.decode(tokenData).token
        }
        return (
          <CrossChainRouteSelectorContent
            {...props}
            dest={getFieldValue(destChainFieldName)}
            source={getFieldValue(sourceChainFieldName)}
            token={tokenData}
          />
        )
      }}
    </Form.Item>
  )
}

export function setCrossChainRouteValue (
  form: FormInstance,
  fieldName: string,
  value: string,
  type: 'source',
  params: Omit<RouterFilter, 'from'>
): boolean
export function setCrossChainRouteValue (
  form: FormInstance,
  fieldName: string,
  value: string,
  type: 'dest',
  params: Omit<RouterFilter, 'to'>
): boolean
export function setCrossChainRouteValue (
  form: FormInstance,
  fieldName: string,
  value: string,
  type: 'source' | 'dest',
  params: RouterFilter
) {
  const options = getRouteOptions(type as any, params as any)
  if (!value || options.find((option) => value === option)) {
    form.setFieldsValue({ [fieldName]: value })
    return true
  }
  return false
}

type CrossChainRouteSelectorContentProps = CrossChainRouteSelectorProps & {
  source: string
  dest: string
  token: string
}
function CrossChainRouteSelectorContent ({
  form,
  token,
  source,
  sourceChainFieldName,
  destChainFieldName,
  className,
  dest,
  tokenFieldName: _tokenFieldName,
  decodeToken: _decodeToken,
  onSourceChainChange,
  onDestChainChange,
  ...props
}: CrossChainRouteSelectorContentProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const onSwapChain = () => {
    const source = form.getFieldValue(sourceChainFieldName)
    const dest = form.getFieldValue(destChainFieldName)
    const isChanged = []
    isChanged.push(setCrossChainRouteValue(
      form,
      sourceChainFieldName,
      dest,
      'source',
      { token, to: source }
    ))
    isChanged.push(setCrossChainRouteValue(
      form,
      destChainFieldName,
      source,
      'dest',
      { token, from: dest }
    ))
    
    if (!isChanged.every((value) => value)) {
      showWarnMessage({ message: t('transfer.errors.swapRouteNotFound') })
      return
    }

    router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        from: dest,
        to: source,
      },
    })

    form.setFieldsValue({
      [destChainFieldName]: source,
      [sourceChainFieldName]: dest,
    })

    console.log(source, dest)
  }

  let destOptions = getRouteOptions('dest', { from: source as any, token })
  let sourceOptions = getRouteOptions('source', { to: dest as any, token })

  return (
    <div
      className={clsx('d-flex align-items-end GapNormal', className)}
      {...props}>
      <TransferChainSelectorFormItem
        chainFilters={sourceOptions}
        style={{ flexBasis: '100%' }}
        selectProps={{ placeholder: 'Select', notFoundContent: 'Route not found' }}
        className='bs-mb-0'
        name={sourceChainFieldName}
        label={t('transfer.source')}
        onChange={onSourceChainChange}
      />
      <MutedDiv>
        <Button
          onClick={onSwapChain}
          size='large'
          type='link'
          className='ColorCurrentColor bs-p-0'>
          <BsArrowLeftRight className='FontMedium d-block' />
        </Button>
      </MutedDiv>
      <TransferChainSelectorFormItem
        onChange={onDestChainChange}
        chainFilters={destOptions}
        style={{ flexBasis: '100%' }}
        selectProps={{ placeholder: 'Select', notFoundContent: 'Route not found' }}
        className='bs-mb-0'
        name={destChainFieldName}
        label={t('transfer.dest')}
      />
    </div>
  )
}
