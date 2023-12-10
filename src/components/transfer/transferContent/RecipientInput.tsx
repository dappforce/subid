import { useChainInfoByNetwork } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { AddressFormItem, AddressFormItemProps } from '../form-items/AddressFormItem'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

type RecipientInputProps = Omit<AddressFormItemProps, 'isRequired' | 'isEthAddress'> & {
  destChain?: string
  disableTransferToSelf?: boolean
}
export default function RecipientInput ({ destChain, disableTransferToSelf, ...props }: RecipientInputProps) {
  const { t } = useTranslation()

  const chainInfo = useChainInfoByNetwork(destChain ?? '')
  const isEthLike = chainInfo?.isEthLike

  const recipientLabelSuffix = isEthLike ? '(EVM)' : ''

  return (
    <AddressFormItem
      {...props}
      isRequired
      isEthAddress={isEthLike}
      validateIsNotSelfErrMsg={disableTransferToSelf ? t('transfer.errors.transferToSelf') : undefined}
      label={`${props.label ?? t('transfer.recipient')} ${recipientLabelSuffix}`}
      className={clsx('bs-mb-0', props.className)}
      inputProps={{
        size: 'large',
        placeholder: t('transfer.placeholders.recipient'),
        ...props.inputProps
      }}
    />
  )
}
