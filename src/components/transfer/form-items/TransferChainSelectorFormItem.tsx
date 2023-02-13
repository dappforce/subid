import { Avatar, Form, FormItemProps, Select, SelectProps } from 'antd'
import clsx from 'clsx'
import React from 'react'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { isDef } from '@subsocial/utils'
import styles from './TransferChainSelectorFormItem.module.sass'

export type TransferChainSelectorFormItemProps = Omit<FormItemProps, 'options'> & {
  selectProps?: SelectProps<string>
  chainFilters: string[]
}

export default function TransferChainSelectorFormItem ({ selectProps, chainFilters, ...props }: TransferChainSelectorFormItemProps) {
  const allChainInfo = useChainInfo()

  const options = chainFilters.map((chain) => {
    const chainInfo = allChainInfo[chain]
    if (!chainInfo) return
    const { name, icon } = chainInfo
    return {
      value: chain,
      label: <NetworkOption name={name} image={`/images/${icon}`} />
    }
  }).filter(isDef)

  return (
    <Form.Item
      {...props}
    >
      <Select size='large' {...selectProps} options={options} />
    </Form.Item>
  )
}

function NetworkOption ({ name, image }: { name: string; image: string }) {
  return (
    <div className={clsx('d-flex align-items-center', styles.NetworkOption)}>
      <Avatar
        src={image}
        className={clsx('mr-2', styles.Avatar)}
      />
      <span>{name}</span>
    </div>
  )
}
