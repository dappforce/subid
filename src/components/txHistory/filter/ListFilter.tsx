import SelectbleDropdown, {
  DropdownActionKind,
} from '@/components/utils/Dropdowns/SelectbleDropdown'
import { MenuItem } from '@/components/utils/Dropdowns/types'
import styles from '../Index.module.sass'
import { LabelWithIcon } from '@/components/table/balancesTable/utils'

type ListFilterProps = {
  menus: MenuItem[]
  filters: string[]
  setFilters: (filter: string[]) => void
  label: string
  labelImage: React.ReactNode
}

const ListFilter = ({ filters, setFilters, menus, label, labelImage }: ListFilterProps) => {
  const onChange = (values: string[], kind: DropdownActionKind) => {
    const newValue = values.find((x) => !filters.includes(x))

    const isAll = newValue === 'all'

    if (kind === 'select' && values.includes('all') && !isAll) {
      setFilters(values.filter((x) => x !== 'all'))
    } else if (kind === 'select' && isAll) {
      setFilters([ 'all' ])
    } else if (kind === 'deselect' && values.length < 1) {
      setFilters([ 'all' ])
    } else {
      setFilters(values)
    }

    window.scrollTo(0, 0)
  }

  return (
    <>
      <SelectbleDropdown
        menu={menus}
        defaultValue={filters[0]}
        onChange={onChange}
        values={filters}
        label={
          <div className={styles.LabelWithCount}>
            <LabelWithIcon
              label={label}
              iconSrc={labelImage}
            />
            {!filters.includes('all') ? `(${filters.length})` : ''}
          </div>
        }
      />
    </>
  )
}

export default ListFilter
