import clsx from 'clsx'
import { MenuListProps } from '../tailwind-components/MenuList'
import { Menu } from '../tailwind-components/floating/DropdownMenu'
import { useResponsiveSize } from 'src/components/responsive'
import { useState } from 'react'
import Button from '../tailwind-components/Button'
import { HiOutlineSwitchVertical } from 'react-icons/hi'
import { HiChevronDown } from 'react-icons/hi2'

type FloatingMenuItemProps = {
  sortBy: string
  changeSortBy: (sortBy: string) => void
  panelClassName?: string
  itemClassName?: string
  panelSize?: MenuListProps['size']
}

const SortByDropDown = ({
  panelClassName,
  panelSize = 'sm',
  itemClassName,
  sortBy,
  changeSortBy,
}: FloatingMenuItemProps) => {
  const { isMobile } = useResponsiveSize()
  const [ isOpen, setIsOpen ] = useState(false)

  const menus = [
    {
      key: 'default',
      text: 'Default',
      onClick: () => changeSortBy('default'),
    },
    // {
    //   key: 'total-stake',
    //   text: 'Total stake',
    //   onClick: () => changeSortBy('total-stake'),
    // },
    // {
    //   key: 'backers',
    //   text: 'Stakers',
    //   onClick: () => changeSortBy('backers'),
    // },
    {
      key: 'my-stake',
      text: 'My stake',
      onClick: () => changeSortBy('my-stake'),
    },
  ]

  const augmentedMenus = menus.map((menu) => ({
    ...menu,
    onClick: () => {
      menu.onClick?.()
      setIsOpen(false)
    },
  }))

  const sortByText = menus.find((menu) => menu.key === sortBy)?.text

  return (
    <div className='flex items-center gap-2'>
      {!isMobile && <span className='text-text-muted'>Sort by:</span>}
      <Menu
        label={'Edit'}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        menus={augmentedMenus}
        itemClassName={itemClassName}
        panelClassName={panelClassName}
        panelSize={panelSize}
        focus={menus.findIndex((menu) => menu.key === sortBy)}
      >
        {(config) => {
          const { referenceProps, otherProps, ref } = config || {}

          const commonProps = {
            ...referenceProps,
            ...otherProps,
            ref,
          }

          return isMobile ? (
            <Button variant='outlined' size='circle' {...commonProps}>
              <HiOutlineSwitchVertical />
            </Button>
          ) : (
            <div
              {...commonProps}
              className='flex cursor-pointer items-center gap-1 text-text-primary'
            >
              <span>{sortByText}</span>
              <HiChevronDown
                className={clsx('transition-transform', isOpen && 'rotate-180')}
              />
            </div>
          )
        }}
      </Menu>
    </div>
  )
}

export default SortByDropDown
