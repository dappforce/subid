import { FormItemProps, InputProps, Form, Tag, FormInstance } from 'antd'
import { Rule } from 'antd/lib/form'
import { checkSameAttributesValues, isValidAddress } from '../../utils'
import {
  useIsMyConnectedAddress,
  useMyAddress,
} from 'src/components/providers/MyExtensionAccountsContext'
import { toGenericAccountId } from 'src/rtk/app/util'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import SelectAccountInput from '../../utils/inputs/SelectAccountInput'

export type AddressFormItemProps = FormItemProps & {
  inputProps?: InputProps
  isRequired?: boolean
  isEthAddress?: boolean
  validateIsNotSelfErrMsg?: string
  form: FormInstance<any>
}

export function AddressFormItem ({ name, form, ...props }: AddressFormItemProps) {
  return (
    <Form.Item
      noStyle
      shouldUpdate={(prev, curr) =>
        !checkSameAttributesValues(prev, curr, [ name?.toString() ?? '' ])
      }>  
      {({ getFieldValue, validateFields, isFieldTouched }) => {
        const fieldName = name ?? ''
        const value = getFieldValue(fieldName)

        return (
          <AddressInput
            recipient={getFieldValue(fieldName)}
            name={name}
            form={form}
            {...props}
            revalidate={async () => {
              console.log(isFieldTouched(fieldName) || value)

              if (isFieldTouched(fieldName) || value) {
                await validateFields([ fieldName ])
              }
            }}
          />
        )
      }}
    </Form.Item>
  )
}

function AddressInput ({
  inputProps,
  rules,
  isRequired,
  isEthAddress,
  validateIsNotSelfErrMsg,
  recipient,
  revalidate,
  form,
  label: _label,
  ...props
}: AddressFormItemProps & { recipient: string; revalidate: () => void }) {
  const { t } = useTranslation()
  const myAddress = useMyAddress()
  const isMyAddress = useIsMyConnectedAddress(recipient)

  useEffect(() => {
    revalidate()
  }, [ isEthAddress, isRequired, validateIsNotSelfErrMsg ])

  const augmentedRules: Rule[] = [
    ...(rules || []),
    ({ getFieldValue }) => ({
      async validator () {
        const address = getFieldValue(props.name ?? '')

        if (isRequired && !address) {
          throw new Error(t('transfer.errors.recipient.required'))
        }
        if (
          address &&
          !isValidAddress(address, {
            eth: !!isEthAddress,
            substrate: !isEthAddress,
          })
        ) {
          throw new Error(t('transfer.errors.recipient.notValid'))
        }
        if (
          validateIsNotSelfErrMsg &&
          toGenericAccountId(myAddress) === toGenericAccountId(address)
        ) {
          throw new Error(validateIsNotSelfErrMsg)
        }
      },
    }),
  ]

  const showYourAddressTag = isMyAddress && !validateIsNotSelfErrMsg
  const label = (
    <span>
      {_label}
      {showYourAddressTag && <Tag color='green' className='ml-1'>{t('transfer.yourAccount')} </Tag>}
    </span>
  )

  return (
    <Form.Item
      {...props}
      label={label}
      rules={augmentedRules}>
      <SelectAccountInput
          disabled={inputProps?.disabled}
          value={'5FToy6nuBv7p6EtTHd2xW8neztzSTpPjtwMevTyBw6j91QKe'}
          form={form}
          withAvatar={false}
          revalidate={revalidate}
        />
    </Form.Item>
  )
}
