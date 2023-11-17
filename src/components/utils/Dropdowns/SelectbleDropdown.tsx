import { Button, Dropdown, Menu } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import { MenuItem } from './types'
import styles from './Index.module.sass'

export type DropdownActionKind = 'select' | 'deselect'

type MenuItemsProps = {
  items: MenuItem[]
  className?: string
  onChange?: (keys: string[], kind: DropdownActionKind) => void
  defaultValue: string,
  values: string[]
}

const MenuItems = ({
  items,
  className,
  onChange,
  values,
  defaultValue,
}: MenuItemsProps) => (
  <Menu
    className={clsx(styles.MenuStyles, className)}
    defaultSelectedKeys={[ defaultValue ]}
    selectedKeys={values}
    onSelect={(item) => onChange?.(item.selectedKeys as string[], 'select')}
    onDeselect={(item) => onChange?.(item.selectedKeys as string[], 'deselect')}
    selectable
    multiple
  >
    {items.map(({ key, label }) => (
      <Menu.Item key={key}>{label}</Menu.Item>
    ))}
  </Menu>
)

type TableDropdownButtonProps = {
  label?: React.ReactNode
  menu: MenuItem[]
  defaultValue: string
  onChange: (values: string[], kind: DropdownActionKind) => void
  menuClassName?: string
  values: string[]
}

const SelectbleDropdown = ({
  label,
  menu,
  defaultValue,
  onChange,
  menuClassName,
  values,
}: TableDropdownButtonProps) => {
  const [ visible, setVisible ] = useState(false)

  return (
    <Dropdown
      visible={visible}
      onVisibleChange={(value) => setVisible(value)}
      overlay={
        <MenuItems
          items={menu}
          defaultValue={defaultValue}
          values={values}
          className={menuClassName}
          onChange={onChange}
        />
      }
      placement='bottomCenter'
      trigger={[ 'click' ]}
    >
      <Button>{label}</Button>
    </Dropdown>
  )
}

export default SelectbleDropdown
