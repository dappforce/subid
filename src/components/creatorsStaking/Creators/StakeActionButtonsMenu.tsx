import { MenuListProps } from '../tailwind-components/MenuList'
import { Menu } from '../tailwind-components/floating/DropdownMenu'
import { useState } from 'react'
import Button from '../tailwind-components/Button'
import { BsThreeDotsVertical } from 'react-icons/bs'
import clsx from 'clsx'

type FloatingMenuItemProps = {
  panelClassName?: string
  itemClassName?: string
  panelSize?: MenuListProps['size']
  openUnstakeModal: () => void
  openMoveStakeModal: () => void
  buttonsSize?: 'sm' | 'lg' | 'md'
  disabled?: boolean
}

const StakeActionButtonsMenu = ({
  panelClassName,
  itemClassName,
  panelSize = 'sm',
  openUnstakeModal,
  openMoveStakeModal,
  buttonsSize = 'sm',
  disabled
}: FloatingMenuItemProps) => {
  const [ isOpen, setIsOpen ] = useState(false)

  const menus = [
    {
      key: 'move-stake',
      text: 'Move stake',
      onClick: () => openMoveStakeModal(),
    },
    {
      key: 'unstake',
      text: 'Unstake',
      onClick: () => openUnstakeModal(),
      className: 'text-red-500',
    },
  ]

  const augmentedMenus = menus.map((menu) => ({
    ...menu,
    onClick: () => {
      menu.onClick?.()
      setIsOpen(false)
    },
  }))

  return (
    <Menu
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      menus={augmentedMenus}
      itemClassName={itemClassName}
      panelClassName={panelClassName}
      panelSize={panelSize}
    >
      {(config) => {
        const { referenceProps, otherProps, ref } = config || {}

        const commonProps = {
          ...referenceProps,
          ...otherProps,
          ref,
        }

        return (
          <Button
            variant='outlined'
            size={'circle'}
            disabled={disabled}
            className={clsx('w-fit h-full', {
              ['p-4']: buttonsSize === 'lg',
              ['p-2']: buttonsSize === 'sm',
            })}
            {...commonProps}
          >
            <BsThreeDotsVertical />
          </Button>
        )
      }}
    </Menu>
  )
}

export default StakeActionButtonsMenu
