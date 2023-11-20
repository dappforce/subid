import { LabelWithIcon } from '@/components/table/balancesTable/utils'
import SelectbleDropdown, {
  DropdownActionKind,
} from '@/components/utils/Dropdowns/SelectbleDropdown'
import EventsIcon from '@/assets/icons/events.svg'
import SentIcon from '@/assets/icons/sent-big.svg'
import ReceivedIcon from '@/assets/icons/received-big.svg'
import styles from '../Index.module.sass'
import clsx from 'clsx'

type EventSelectorProps = {
  events: string[]
  setEvents: (networks: string[]) => void
}

export const eventsVariantsOpt = [
  {
    label: (
      <LabelWithIcon
        label={'All Events'}
        iconClassName={clsx(styles.MenuItemAll, styles.AllEventsIcon)}
        iconSrc={<EventsIcon />}
      />
    ),
    key: 'all',
    className: styles.AllEvents,
  },
  {
    label: (
      <LabelWithIcon
        iconClassName={styles.IconBox}
        label={'Sent'}
        iconSrc={<SentIcon />}
      />
    ),
    key: 'transfer_from',
  },
  {
    label: (
      <LabelWithIcon
        iconClassName={styles.IconBox}
        label={'Received'}
        iconSrc={<ReceivedIcon />}
      />
    ),
    key: 'transfer_to',
  },
]

const EventSelector = ({ events, setEvents }: EventSelectorProps) => {
  const onChange = (values: string[], kind: DropdownActionKind) => {
    const newValue = values.find((x) => !events.includes(x))

    const isAll = newValue === 'all'

    if (kind === 'select' && values.includes('all') && !isAll) {
      setEvents(values.filter((x) => x !== 'all'))
    } else if (kind === 'select' && isAll) {
      setEvents([ 'all' ])
    } else if (kind === 'deselect' && values.length < 1) {
      setEvents([ 'all' ])
    } else {
      setEvents(values)
    }
  }

  return (
    <>
      <SelectbleDropdown
        menu={eventsVariantsOpt}
        defaultValue={events[0]}
        onChange={onChange}
        values={events}
        label={
          <div className={styles.LabelWithCount}>
            <LabelWithIcon label={'Events'} iconSrc={<EventsIcon />} />
            {!events.includes('all') ? `(${events.length})` : ''}
          </div>
        }
      />
    </>
  )
}

export default EventSelector
