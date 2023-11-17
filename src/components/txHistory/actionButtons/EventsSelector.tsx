import { LabelWithIcon } from '@/components/table/balancesTable/utils'
import SelectbleDropdown, {
  DropdownActionKind,
} from '@/components/utils/Dropdowns/SelectbleDropdown'
import EventsIcon from '@/assets/icons/events.svg'

type EventSelectorProps = {
  events: string[]
  setEvents: (networks: string[]) => void
}

export const eventsVariantsOpt = [
  {
    label: <LabelWithIcon label={'All Events'} iconSrc={<EventsIcon />} />,
    key: 'all',
  },
  {
    label: 'Sent',
    key: 'transfer_from',
  },
  {
    label: 'Received',
    key: 'transfer_to',
  },
]

const EventSelector = ({ events, setEvents }: EventSelectorProps) => {
  const onChange = (values: string[], kind: DropdownActionKind) => {
    const newValue = values.find((x) => !events.includes(x))

    const isAll = newValue === 'all'

    if (kind === 'select' && values.includes('all') && !isAll) {
      setEvents(values.filter((x) => x !== 'all'))
      return
    } else if (kind === 'select' && isAll) {
      setEvents([ 'all' ])
      return
    } else if (kind === 'deselect' && values.length < 1) {
      return
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
          <LabelWithIcon label={'Events'} iconSrc={<EventsIcon />} />
        }
      />
    </>
  )
}

export default EventSelector
