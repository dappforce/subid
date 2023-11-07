import { Button, Dropdown, Menu } from 'antd'
import { MenuItem } from '../types'

type MenuItemsProps = {
  items: MenuItem[]
  className?: string
  onClick?: (key: string) => void
  defaultValue: string
}

const MenuItems = ({
  items,
  className,
  onClick,
  defaultValue,
}: MenuItemsProps) => (
  <Menu
    className={className}
    defaultSelectedKeys={[defaultValue]}
    onClick={(item) => onClick?.(item.key.toString())}
  >
    {items.map(({ key, label }) => (
      <Menu.Item key={key}>{label}</Menu.Item>
    ))}
  </Menu>
)

type TableDropdownButtonProps = {
  label?: string
  menu: MenuItem[]
  defaultValue: string
  value: string
  onChange: (value: string) => void
  menuClassName?: string
}

const TableDropdownButton = ({
  label,
  menu,
  defaultValue,
  value,
  onChange,
  menuClassName,
}: TableDropdownButtonProps) => {
  const itemLabel = (menu?.find((item) => item?.key === value) as any)?.label

  return (
    <Dropdown
      overlay={
        <MenuItems
          items={menu}
          defaultValue={defaultValue}
          className={menuClassName}
          onClick={onChange}
        />
      }
      placement='bottomCenter'
      trigger={[ 'click' ]}
    >
      <Button>{label || itemLabel}</Button>
    </Dropdown>
  )
}

export default TableDropdownButton
