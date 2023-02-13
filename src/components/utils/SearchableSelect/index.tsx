import React, { useRef, useState } from 'react'
import { Select } from 'antd'
import type { SelectProps } from 'antd/es/select'
import clsx from 'clsx'
import styles from './index.module.sass'

export type SearchableSelectOption = {
  label: any
  value: string
  filterData: string
}

export interface SearchableSelectProps extends Omit<SelectProps<string>, 'options' | 'children'> {
  options: SearchableSelectOption[]
}

export default function SearchableSelect ({ options, className, ...props }: SearchableSelectProps) {
  const [ searchValue, setSearchValue ] = useState('')
  const previousValidValueRef = useRef(props.value)
  return (
    <Select
      showSearch
      searchValue={searchValue}
      onSearch={(search) => {
        if (searchValue === '')
          previousValidValueRef.current = props.value
        setSearchValue(search)
        props.onSearch?.(search)
      }}
      onSelect={(...params) => {
        previousValidValueRef.current = ''
        props.onSelect?.(...params)
      }}
      onBlur={(e) => {
        if (previousValidValueRef.current) {
          props.onChange?.(previousValidValueRef.current, { value: previousValidValueRef.current, options })
          previousValidValueRef.current = ''
        }
        props.onBlur?.(e)
      }}
      className={clsx(styles.SearchableSelect, className)}
      filterOption={(input, option) => {
        return (option as SearchableSelectOption).filterData.toLowerCase().includes(input.toLowerCase())
      }}
      notFoundContent='Not Found'
      {...props}
      options={options}
    />
  )
}
