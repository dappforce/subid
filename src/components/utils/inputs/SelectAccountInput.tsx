import { Select, FormInstance } from 'antd'
import { FC, useEffect, useState } from 'react'
import { isEmptyArray } from '@subsocial/utils'
import styles from './inputs.module.sass'
import {
  useMyExtensionAccount,
  useMyExtensionAddresses,
} from '../../providers/MyExtensionAccountsContext'
import { isValidAddress, equalAddresses } from '../index'
import { toGenericAccountId } from '../../../rtk/app/util'
import BaseAvatar from '../DfAvatar'
import { AddressProps } from '../../homePage/address-views/utils/types'
import {
  useIdentities,
  getSubsocialIdentity,
} from '../../../rtk/features/identities/identitiesHooks'
import Name from '../../homePage/address-views/Name'

type SelectAddressType = AddressProps & {
  onClick?: () => void
  withShortAddress?: boolean
}

export const SelectAddressPreview: FC<SelectAddressType> = ({
  address,
  onClick,
}) => {
  const identity = useIdentities(address.toString())

  const subsocialIdentity = getSubsocialIdentity(identity)

  return (
    <div className='DfChooseAccount align-items-center' onClick={onClick}>
      <div className='DfAddressIcon d-flex align-items-center'>
        <BaseAvatar
          size={32}
          address={address}
          avatar={subsocialIdentity?.image}
        />
      </div>
      <div className='DfAddressInfo ui--AddressComponents'>
        <Name identities={identity} address={address} withShortAddress />
      </div>
    </div>
  )
}

type SelectAccountInputProps = {
  form: FormInstance<any>
  className?: string
  setValue?: (value: string) => void
  value?: string
  disabled?: boolean
  withAvatar?: boolean
  revalidate: () => void
}

const filterSelectOptions = (adresses: string[], value?: string) => {
  return adresses
    .filter((x) => {
      return !equalAddresses(x, value)
    })
    .map((address, index) => {
      return {
        key: address + index,
        label: (
          <SelectAddressPreview address={address} withShortAddress={true} />
        ),
        value: address,
      }
    })
}

export const SelectAccountInput = ({
  value,
  className,
  withAvatar = true,
  disabled,
  form,
  revalidate
}: SelectAccountInputProps) => {
  const { extensionStatus } = useMyExtensionAccount()
  const extensionAddress = useMyExtensionAddresses()

  const allExtensionAccounts = extensionAddress.map(
    (x) => toGenericAccountId(x.address) as string
  )

  const [ defaultOptions, setDefaultOptions ] = useState<any[]>([])
  const [ selectOptions, setSelectOptions ] = useState<any[]>(defaultOptions)
  const identity = useIdentities(value)

  const subsocialIdentity = getSubsocialIdentity(identity)

  useEffect(() => {
    const options =
      extensionStatus === 'OK'
        ? filterSelectOptions(allExtensionAccounts, value)
        : []

    if (!defaultOptions || isEmptyArray(defaultOptions)) {
      setDefaultOptions(options)
    }

    setSelectOptions(options)
    revalidate()
  }, [ value, extensionStatus ])

  const onSelectChange = (value: string) => {
    form.setFieldsValue({ ['recipient']: value })
  }

  const onSearchHandler = (searchValue: any) => {
    const options = []

    if (searchValue && isValidAddress(searchValue)) {
      options.push({
        key: searchValue,
        label: (
          <SelectAddressPreview
            address={toGenericAccountId(searchValue)}
            withShortAddress={true}
          />
        ),
        value: searchValue,
      })
    } else {
      const filterOptions = defaultOptions.filter((x: any) =>
        x.value.includes(searchValue)
      )

      if (!isEmptyArray(filterOptions)) {
        options.push(...filterOptions)
      }
    }

    !isEmptyArray(options) && setSelectOptions(options)
  }

  const onSelectHandler = (searchValue: any) => {
    const filterOptions = defaultOptions.filter(
      (x: any) => !x.value.includes(searchValue)
    )

    if (filterOptions) {
      setSelectOptions(filterOptions as any[])
    }

    revalidate()
  }

  const onClear = () => {
    setSelectOptions(defaultOptions)
  }

  const avatar = (
    <div className='bs-mr-2'>
      {value ? (
        <BaseAvatar
          address={value}
          avatar={subsocialIdentity?.image}
          size={50}
        />
      ) : (
        <div className={`${styles.Circle} bs-mr-2`}></div>
      )}
    </div>
  )

  return (
    <div className='d-flex align-items-center'>
      {withAvatar && avatar}
      <Select
        disabled={disabled}
        showSearch
        allowClear
        size='large'
        optionLabelProp='value'
        className={className}
        value={value}
        defaultActiveFirstOption
        options={selectOptions}
        onSearch={onSearchHandler}
        onSelect={onSelectHandler}
        onChange={onSelectChange}
        onClear={onClear}
        placeholder={'Recipient address'}
      />
    </div>
  )
}

export default SelectAccountInput
