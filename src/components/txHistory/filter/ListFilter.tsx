import SelectbleDropdown, {
  DropdownActionKind,
} from '@/components/utils/Dropdowns/SelectableDropdown'
import { MenuItem } from '@/components/utils/Dropdowns/types'
import styles from '../Index.module.sass'
import { LabelWithIcon } from '@/components/table/balancesTable/utils'
import { useState } from 'react'
import { useResponsiveSize } from '@/components/responsive'

type ListFilterProps = {
  menus: MenuItem[]
  filters: string[]
  setFilters: (filter: string[]) => void
  label: string
  labelImage: React.ReactNode
  scrollPosition?: number
}

const ListFilter = ({ filters, setFilters, menus, label, labelImage, scrollPosition }: ListFilterProps) => {
  const [ visible, setVisible ] = useState(false)
  const { isMobile } = useResponsiveSize()

  const onChange = (values: string[], kind: DropdownActionKind) => {
    const newValue = values.find((x) => !filters.includes(x))

    const isAll = newValue === 'all'

    if (kind === 'select' && values.includes('all') && !isAll) {
      setFilters(values.filter((x) => x !== 'all'))
    } else if (kind === 'select' && isAll) {
      setFilters([ 'all' ])
      setVisible(false)
    } else if (kind === 'deselect' && values.length < 1) {
      setFilters([ 'all' ])
    } else {
      setFilters(values)
    }


    window.scrollTo(0, isMobile ? scrollPosition || 0 : 0)
  }

  return (
    <>
      <SelectbleDropdown
        visible={visible}
        setVisible={setVisible}
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
