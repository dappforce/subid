import { ReactNode } from 'react'
import MenuList, { MenuListProps } from '../MenuList'
import FloatingWrapper, { FloatingWrapperProps } from './FloatingWrapper'
import clsx from 'clsx'

type FloatingMenuItemProps = {
  beforeMenus?: ReactNode
  afterMenus?: ReactNode
  menus: MenuListProps['menus']
  closeMenu: () => void
  panelClassName?: string
  panelSize?: MenuListProps['size']
}
export type FloatingMenusProps = Omit<FloatingWrapperProps, 'panel'> &
  Omit<FloatingMenuItemProps, 'closeMenu'> & {
    children: (
      config?: Parameters<FloatingWrapperProps['children']>[0]
    ) => JSX.Element
  }

export default function FloatingMenus (props: FloatingMenusProps) {
  const {
    children,
    ...otherProps
  } = props
  if (otherProps.menus.length === 0) {
    return children()
  }

  return (
    <FloatingWrapper
      {...otherProps}
      panel={(closeMenu) => (
        <FloatingMenuPanel {...props} closeMenu={closeMenu} />
      )}
    >
      {children}
    </FloatingWrapper>
  )
}

function FloatingMenuPanel ({
  menus,
  closeMenu,
  panelClassName,
  panelSize = 'sm',
  afterMenus,
  beforeMenus,
}: FloatingMenuItemProps) {
  const augmentedMenus = menus.map((menu) => ({
    ...menu,
    onClick: () => {
      menu.onClick?.()
      closeMenu()
    },
  }))

  return (
    <div
      className={clsx(
        'flex flex-col overflow-hidden rounded-lg bg-background-light shadow-[0_5px_50px_-12px_rgb(0,0,0,.25)] dark:shadow-[0_5px_50px_-12px_rgb(0,0,0)]',
        panelSize === 'xs' ? 'w-48' : 'w-56',
        panelClassName
      )}
    >
      {beforeMenus}
      <MenuList size={panelSize} menus={augmentedMenus} />
      {afterMenus}
    </div>
  )
}
