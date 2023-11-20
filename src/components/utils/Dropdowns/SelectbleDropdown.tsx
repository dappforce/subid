import { Button, Dropdown, Menu } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import { MenuItem } from './types'
import styles from './Index.module.sass'
import { IoCheckmarkSharp } from 'react-icons/io5'

export type DropdownActionKind = 'select' | 'deselect'

type SelectbleMenuItem = MenuItem & {
  className?: string
}

type MenuItemsProps = {
  items: SelectbleMenuItem[]
  className?: string
  onChange?: (keys: string[], kind: DropdownActionKind) => void
  defaultValue: string
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
    className={clsx(styles.SelectbleMenuStyles, className)}
    defaultSelectedKeys={[ defaultValue ]}
    selectedKeys={values}
    onSelect={(item) => onChange?.(item.selectedKeys as string[], 'select')}
    onDeselect={(item) => onChange?.(item.selectedKeys as string[], 'deselect')}
    selectable
    multiple
  >
    {items.map(({ key, label, className }) => {
      const isSelected = values.includes(key)
      return (
        <Menu.Item key={key} className={clsx(styles.SelectbleMenuItem, className)}>
          {label} {isSelected && <IoCheckmarkSharp />}
        </Menu.Item>
      )
    })}
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
      <Button className='ColoredIcon'>{label}</Button>
    </Dropdown>
  )
}

export default SelectbleDropdown
