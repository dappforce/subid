import { Button, Dropdown } from 'antd'
import { MenuProps } from 'antd/lib'

type TableDropdownButtonProps = {
  label?: string
  menu: MenuProps['items']
  defaultValue: string | string[]
  value: string
  onChange: (value: string) => void
  onDeselect?: (value: string) => void
  menuClassName?: string
  multiple?: boolean
}

const TableDropdownButton = ({
  label,
  menu,
  defaultValue,
  value,
  onChange,
  onDeselect,
  menuClassName,
  multiple = false,
}: TableDropdownButtonProps) => {
  const itemLabel = (menu?.find((item) => item?.key === value) as any)?.label

  return (
    <Dropdown
      menu={{
        items: menu,
        selectable: true,
        defaultSelectedKeys:
          typeof defaultValue === 'string' ? [ defaultValue ] : defaultValue,
        onSelect: ({ key }) => onChange(key as string),
        onDeselect: ({ key }) => onDeselect?.(key as string),
        multiple,
        className: menuClassName,
      }}
      placement='bottomCenter'
      trigger={[ 'click' ]}
    >
      <Button>{label || itemLabel}</Button>
    </Dropdown>
  )
}

export default TableDropdownButton
