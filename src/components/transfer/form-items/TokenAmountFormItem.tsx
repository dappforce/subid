import { toShortMoney } from '@subsocial/utils'
import {
  FormInstance,
  Button,
  Form,
  FormItemProps,
  Input,
  InputProps,
} from 'antd'
import { Rule } from 'antd/lib/form'
import { NamePath } from 'antd/lib/form/interface'
import clsx from 'clsx'
import React, { HTMLProps, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import AlertPanel from 'src/components/utils/AlertPanel'
import { useFetchTransferFee } from 'src/rtk/features/fees/feesHooks'
import { formatBalance } from '@polkadot/util'
import { useChainInfoByNetwork } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { useTransferableBalance } from 'src/utils/hooks/useTransferableBalance'

export type TokenAmountInputProps = Omit<InputProps, 'suffix'> & {
  onMaxClick?: () => void
  disableMaxButton?: boolean
}

export function TokenAmountInput ({
  disableMaxButton,
  onMaxClick,
  ...props
}: TokenAmountInputProps) {
  const { t } = useTranslation()
  const maxBtn = onMaxClick && (
    <Button
      disabled={disableMaxButton}
      type='link'
      className='font-weight-semibold pr-2'
      onClick={onMaxClick}
    >
      {t('transfer.max')}
    </Button>
  )

  return <Input {...props} min='0' step='0.1' type='number' suffix={maxBtn} />
}

export type TokenAmountFormItemProps = FormItemProps & {
  form: FormInstance
  getToken: () => string
  getSourceChain: () => string
  getDestChain?: () => string | undefined
  getCrossChainFee?: () => number
  containerProps?: HTMLProps<HTMLDivElement>
  inputProps?: Omit<TokenAmountInputProps, 'onMaxClick'>
}

const getTokenData = (
  getToken: TokenAmountFormItemProps['getToken'],
  getSourceChain: TokenAmountFormItemProps['getSourceChain'],
  getDestChain: TokenAmountFormItemProps['getDestChain'],
) => {
  const token = getToken() || ''
  const sourceChain = getSourceChain() || ''
  const destChain = getDestChain?.() || ''

  return { token, sourceChain, destChain }
}

export function TokenAmountFormItem ({
  form,
  inputProps,
  rules,
  containerProps,
  getToken,
  getCrossChainFee,
  getSourceChain,
  getDestChain,
  ...props
}: TokenAmountFormItemProps) {
  const { t } = useTranslation()
  const { setFieldsValue } = form
  const { token, sourceChain, destChain } = getTokenData(
    getToken,
    getSourceChain,
    getDestChain,
  )
  const { formattedTransferableBalance: currentBalance, tokenDecimal } =
    useTransferableBalance(token, sourceChain)
  const { fee, loading } = useFetchTransferFee({
    source: sourceChain,
    dest: destChain,
    token,
  })

  const getMaxTransfer = () => {
    if (token !== fee?.token) return currentBalance

    const formattedFee = parseFloat(
      formatBalance(fee?.amount, {
        forceUnit: '-',
        decimals: tokenDecimal,
        withSi: false,
      })
    )
    const feeOffset = 1.1
    const finalFee = formattedFee * feeOffset
    return currentBalance - finalFee
  }
  const maxTransfer = getMaxTransfer()

  useEffect(() => {
    if (!props.name || !form.isFieldTouched(props.name)) return
    form.validateFields([ props.name ])
  }, [ form, maxTransfer ])

  const onMaxClick = () => {
    const name = props.name?.toString()
    if (name) setFieldsValue({ [name]: maxTransfer })
  }

  const augmentedRules: Rule[] = [
    ...(rules || []),
    ({ getFieldValue }) => ({
      async validator () {
        const amount = parseFloat(getFieldValue(props.name ?? ''))
        if (isNaN(amount) || amount <= 0) {
          throw new Error(t('transfer.errors.amount.zero'))
        }
        if (amount > maxTransfer) {
          throw new Error(t('transfer.errors.amount.exceedMax'))
        }
      },
    }),
  ]

  return (
    <div
      {...containerProps}
      className={clsx('w-100', containerProps?.className)}
    >
      <Form.Item
        {...props}
        className={clsx('bs-mb-0', props.className)}
        rules={augmentedRules}
      >
        <TokenAmountInput
          {...inputProps}
          disableMaxButton={loading || maxTransfer <= 0}
          onMaxClick={onMaxClick}
        />
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue, getFieldError }) => {
          const fieldName = props.name ?? ''
          const isError = getFieldError(fieldName).length > 0

          return (
            <div className='bs-mb-4'>
              {!isError && (
                <ExistentialDepositAlert
                  name={props.name ?? ''}
                  getFieldValue={getFieldValue}
                  getCrossChainFee={getCrossChainFee}
                  getSourceChain={getSourceChain}
                  getDestChain={getDestChain}
                  getToken={getToken}
                />
              )}
            </div>
          )
        }}
      </Form.Item>
    </div>
  )
}

const existentialDepositLink =
  'https://support.polkadot.network/support/solutions/articles/65000168651-what-is-the-existential-deposit-#:~:text=On%20the%20Polkadot%20network%2C%20an,the%20Existential%20Deposit%20(ED)'

type ExistentialDepositAlertProps = Pick<
  TokenAmountFormItemProps,
  | 'getDestChain'
  | 'getSourceChain'
  | 'getToken'
  | 'getCrossChainFee'
  | 'name'
> & {
  getFieldValue: (name: NamePath) => any
}
function ExistentialDepositAlert ({
  getFieldValue,
  getCrossChainFee,
  name,
  getSourceChain,
  getDestChain,
  getToken,
}: ExistentialDepositAlertProps) {
  const { t } = useTranslation()

  const fieldName = name ?? ''
  const currentAmount = parseFloat(getFieldValue(fieldName))
  const { token, sourceChain, destChain } = getTokenData(
    getToken,
    getSourceChain,
    getDestChain,
  )
  const crossChainFee = destChain ? getCrossChainFee?.() || 0 : 0

  const sourceChainInfo = useChainInfoByNetwork(sourceChain)
  const destChainInfo = useChainInfoByNetwork(destChain)

  const {
    formattedTransferableBalance: currentBalance,
    existentialDeposit: sourceExistentialDeposit = 0,
  } = useTransferableBalance(token, sourceChain)
  const { existentialDeposit: destExistentialDeposit = 0 } =
    useTransferableBalance(token, destChain || sourceChain)

  if (currentAmount <= 0) return null

  const totalFeeAndDeposit = destExistentialDeposit + crossChainFee
  const insufficientDestExistential = currentAmount < totalFeeAndDeposit
  const insufficientSourceExistential =
    currentBalance - currentAmount < sourceExistentialDeposit
  const showExistentialDepositHelper =
    insufficientDestExistential || insufficientSourceExistential

  const getAlertDest = () => {
    const network = destChainInfo?.name || sourceChainInfo?.name
    const existential = `${destExistentialDeposit} ${token}`
    const minTransfer = `${toShortMoney({
      num: totalFeeAndDeposit,
      fractions: 4,
    })} ${token}`
    return (
      <Trans
        t={t}
        values={{ token, existential, network, minTransfer }}
        i18nKey='transfer.existentialDepositInDestAlert'
      >
        The{' '}
        <a
          target='_blank'
          rel='noreferrer noopener'
          href={existentialDepositLink}
        >
          existential deposit
        </a>{' '}
        for token on network is existential. Please transfer more than
        minTransfer.
      </Trans>
    )
  }
  const getAlertSource = () => {
    const existential = `${sourceExistentialDeposit} ${token}`
    const network = sourceChainInfo?.name
    return (
      <Trans
        t={t}
        values={{ token, network, existential }}
        i18nKey='transfer.existentialDepositInSourceAlert'
      >
        The{' '}
        <a
          target='_blank'
          rel='noreferrer noopener'
          href={existentialDepositLink}
        >
          existential deposit
        </a>{' '}
        for token on network is existential. Please leave at least existential
        or transfer the entire balance to prevent your account from being
        reaped.
      </Trans>
    )
  }

  const alertDest = getAlertDest()
  const alertSource = getAlertSource()

  return (
    <div className='bs-mb-4'>
      {showExistentialDepositHelper && (
        <AlertPanel
          showDefaultIcon
          desc={insufficientDestExistential ? alertDest : alertSource}
          alertType='warning'
          className='mt-3'
        />
      )}
    </div>
  )
}
