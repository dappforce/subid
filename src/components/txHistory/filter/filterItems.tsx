import { PiShareNetworkLight } from 'react-icons/pi'
import { LabelWithIcon } from '../../table/balancesTable/utils'
import { getIconUrl } from '../../utils'
import styles from '../Index.module.sass'
import EventsIcon from '@/assets/icons/events.svg'
import clsx from 'clsx'
import SentIcon from '@/assets/icons/sent-big.svg'
import ReceivedIcon from '@/assets/icons/received-big.svg'

export const networksVariantsWithIconOpt = [
  {
    label: (
      <LabelWithIcon
        label={'All Networks'}
        iconClassName={styles.MenuItemAll}
        iconSrc={<PiShareNetworkLight />}
      />
    ),
    key: 'all',
  },
  {
    label: (
      <LabelWithIcon
        label={'Polkadot'}
        iconSize={24}
        iconSrc={getIconUrl('polkadot.svg')}
      />
    ),
    key: 'polkadot',
  },
  {
    label: (
      <LabelWithIcon
        label={'Kusama'}
        iconSize={24}
        iconSrc={getIconUrl('kusama.svg')}
      />
    ),
    key: 'kusama',
  },
  {
    label: (
      <LabelWithIcon
        label={'Astar'}
        iconSize={24}
        iconSrc={getIconUrl('astar.png')}
      />
    ),
    key: 'astar',
  },
  {
    label: (
      <LabelWithIcon
        label={'Moonbeam'}
        iconSize={24}
        iconSrc={getIconUrl('moonbeam.png')}
      />
    ),
    key: 'moonbeam',
  },
  {
    label: (
      <LabelWithIcon
        label={'Moonriver'}
        iconSize={24}
        iconSrc={getIconUrl('moonriver.svg')}
      />
    ),
    key: 'moonriver',
  },
]

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