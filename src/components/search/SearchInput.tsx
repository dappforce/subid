import React, { useEffect, useState } from 'react'
import { Input } from 'antd'
import { SizeType } from 'antd/lib/config-provider/SizeContext'
import { useSendGaUserEvent } from '../../ga/events'
import { useRouter } from 'next/router'
import { useIsMyAddress } from '../providers/MyExtensionAccountsContext'
import { useTranslation } from 'react-i18next'

const { Search } = Input

type SearchInputProps = {
  size?: SizeType
  hideSearch?: () => void
  autoFocus?: boolean
  className?: string
  isMulti?: boolean
}

const SearchInput = ({ size = 'middle', hideSearch, autoFocus = false, className, isMulti }: SearchInputProps) => {
  const router = useRouter()
  const { t } = useTranslation()

  const { query: { address } } = router
  const addressFromUrl = address as string | undefined

  const isMyAddress = useIsMyAddress(addressFromUrl)

  const sendGAEvent = useSendGaUserEvent()

  const defaultSearchValue = addressFromUrl && !isMyAddress ? addressFromUrl : ''

  const [ searchValue, setSearchValue ] = useState<string>(defaultSearchValue)

  useEffect(() => {
    setSearchValue(isMyAddress || isMulti ? '' : addressFromUrl || defaultSearchValue)
    !addressFromUrl && hideSearch?.()
  }, [ addressFromUrl ])

  const onSearch = (value: string) => {
    sendGAEvent(`Search for ${value}`)

    value && router.push(`/${value}`)
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.currentTarget.value)

  return (
    <div className='d-flex w-100 justify-content-center'>
      <div className='DfSearch'>
        <Search
          className={className}
          allowClear
          autoFocus={autoFocus}
          placeholder={t('placeholders.searchAccountAddress')}
          onSearch={onSearch}
          size={size}
          value={searchValue}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

export default SearchInput
