import { Listbox, Transition } from '@headlessui/react'
import Image, { ImageProps } from 'next/image'
import React, { Fragment, isValidElement } from 'react'
import { IoIosArrowDown } from 'react-icons/io'
import { interactionRingStyles } from '../utils'
import clsx from 'clsx'

export type ListItem<AdditionalData = {}> = {
  id: string
  icon?: ImageProps['src'] | JSX.Element
  label: React.ReactNode
  disabledItem?: boolean | string
} & AdditionalData

type SelectInputProps<AdditionalData> = {
  fieldLabel?: string
  items: ListItem<AdditionalData>[]
  selected?: ListItem<AdditionalData> | null
  setSelected: (item: ListItem<AdditionalData>) => void
  imgClassName?: string
  renderItem?: (item: ListItem<AdditionalData>, open: boolean) => JSX.Element
  placeholder?: React.ReactNode
  rightLabelItem?: React.ReactNode
  disabled?: boolean
  className?: string
}

export default function SelectInput<AdditionalData = {}> ({
  items,
  fieldLabel,
  selected,
  setSelected,
  imgClassName,
  renderItem,
  disabled,
  rightLabelItem,
  placeholder,
  className
}: SelectInputProps<AdditionalData>) {
  return (
    <div>
      <Listbox value={selected} onChange={setSelected} disabled={disabled}>
        {({ open }) => (
          <>
            {fieldLabel && (
              <Listbox.Label className='flex items-center justify-between mb-2 text-sm font-normal leading-4 text-text-muted'>
                {fieldLabel}
                {rightLabelItem}
              </Listbox.Label>
            )}
            <div className='relative'>
              <Listbox.Button
                className={clsx(
                  'relative w-full cursor-default rounded-xl',
                  selected?.icon && !isValidElement(selected?.icon)
                    ? 'py-2'
                    : 'py-3',
                  'pl-4 pr-12 text-left',
                  'appearance-none text-base ring-1 ring-border-gray',
                  'bg-background text-text',
                  className,
                  interactionRingStyles()
                )}
              >
                <span className='flex items-center gap-3'>
                  {selected?.icon &&
                    (isValidElement(selected.icon) ? (
                      selected.icon
                    ) : (
                      <Image
                        src={selected.icon as string}
                        className={clsx('rounded-full', imgClassName)}
                        alt=''
                        role='presentation'
                      />
                    ))}
                  <span className='block truncate'>
                    {selected?.label ?? placeholder ?? ''}
                  </span>
                </span>
                <span className='pointer-events-none absolute inset-y-0 right-0 ml-2 flex items-center pr-4'>
                  <IoIosArrowDown
                    className='h-5 w-5 text-text-muted'
                    aria-hidden='true'
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave='transition ease-in duration-100'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <Listbox.Options
                  className={clsx(
                    'rounded-lg bg-background-light shadow-[0_5px_50px_-12px_rgb(0,0,0,.25)] dark:shadow-[0_5px_50px_-12px_rgb(0,0,0)]',
                    'absolute z-10 mt-1 max-h-56 w-full overflow-auto',
                    'p-1.5 text-base shadow-lg',
                    'ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'
                  )}
                >
                  {items.map((item, i) => {
                    const renderedItem = renderItem?.(item, open)

                    return (
                      <SelectListItem
                        key={i}
                        item={item}
                        imgClassName={imgClassName}
                        renderedItem={renderedItem}
                      />
                    )
                  })}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}

type SelectListItemProps<AdditionalData> = {
  item: ListItem<AdditionalData>
  imgClassName?: string
  renderedItem?: JSX.Element
}

function SelectListItem<AdditionalData> ({
  item,
  imgClassName,
  renderedItem,
}: SelectListItemProps<AdditionalData>) {
  return (
    <Listbox.Option
      disabled={!!item.disabledItem}
      className={() =>
        clsx(
          'relative flex items-center rounded-lg outline-none transition-colors',
          'gap-4 px-3 py-2 text-text hover:bg-background-lighter focus:bg-background-lighter',
          { ['hover:bg-background-light']: item.disabledItem }
        )
      }
      value={item}
    >
      {() => (
        <div className='flex w-full items-center justify-between gap-1'>
          {renderedItem ? (
            renderedItem
          ) : (
            <>
              <div className='flex items-center gap-3'>
                {item.icon &&
                  (isValidElement(item.icon) ? (
                    item.icon
                  ) : (
                    <Image
                      src={item.icon as string}
                      className={clsx('rounded-full', imgClassName)}
                      alt=''
                      role='presentation'
                    />
                  ))}
                <span
                  className={clsx('block truncate text-base', {
                    ['text-gray-500']: item.disabledItem,
                  })}
                >
                  {item.label}
                </span>
              </div>
              {item.disabledItem && (
                <div className='text-gray-500'>
                  {typeof item.disabledItem === 'string'
                    ? item.disabledItem
                    : ''}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Listbox.Option>
  )
}
