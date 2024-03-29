import { cva, VariantProps } from 'class-variance-authority'
import React, { ComponentProps, isValidElement } from 'react'
import Button from './Button'
import clsx from 'clsx'

type MenuListVariants = {
  size: {
    md: string
    sm: string
    xs: string
  }
}
const menuListStyles = cva<MenuListVariants>('flex w-full flex-col', {
  variants: {
    size: {
      md: 'p-3',
      sm: 'p-1.5',
      xs: 'p-1',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
const menuListItemStyles = cva<MenuListVariants>(
  clsx(
    'relative flex items-center rounded-lg outline-none transition-colors',
    'focus:!bg-background-lighter hover:!bg-background-lighter'
  ),
  {
    variants: {
      size: {
        md: 'px-4 py-3 gap-6',
        sm: 'px-3 py-2 gap-4',
        xs: 'px-2 py-1.5 gap-2',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

type Menu = {
  text: string | JSX.Element
  iconClassName?: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  href?: string
  disabled?: boolean
  className?: string
}
export type MenuListProps = ComponentProps<'div'> &
  VariantProps<typeof menuListStyles> & {
    menus: Menu[]
    itemClassName?: string
  }

export default function MenuList ({ menus, size, itemClassName, ...props }: MenuListProps) {
  return (
    <div {...props} className={clsx(menuListStyles({ size }), props.className)}>
      {menus.map(
        ({ icon: Icon, onClick, text, href, iconClassName, disabled, className }, idx) => (
          <Button
            key={idx}
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            variant='transparent'
            size='noPadding'
            disabled={disabled}
            interactive='none'
            className={clsx(menuListItemStyles({ size }), itemClassName, className, 'text-left')}
            disabledStyle='subtle'
            onClick={onClick}
          >
            {Icon && <Icon
              className={clsx(
                'flex-shrink-0 text-[1.25em] text-text-muted',
                iconClassName
              )}
            />}
            {isValidElement(text) ? text : <span>{text}</span>}
          </Button>
        )
      )}
    </div>
  )
}
