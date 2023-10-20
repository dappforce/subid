import { Button } from 'antd'
import styles from './Index.module.sass'
import { TransferRow } from './transactions/Transfer'
import { VoteRow } from './transactions/Vote'
import { ClaimRow } from './transactions/Claim'
import TableDropdownButton from '../table/balancesTableNew/utils/TableDropdownButton'
import { useState } from 'react'

const networksOpt = [
  {
    key: 'all',
    label: 'All Networks',
  },
  {
    key: 'polkadot',
    label: 'Polkadot',
  },
  {
    key: 'kusama',
    label: 'Kusama',
  },
  {
    key: 'moonbeam',
    label: 'Moonbeam',
  },
]

const eventsOpt = [
  {
    key: 'all',
    label: 'All Events',
  },
  {
    key: 'received',
    label: 'Received',
  },
  {
    key: 'sent',
    label: 'Sent',
  },
  {
    key: 'ayed',
    label: 'Ayed',
  },
  {
    key: 'nayed',
    label: 'Nayed',
  },
  {
    key: 'claimed',
    label: 'Claimed',
  },
]

const ActionButtons = () => {
  const [ network, setNetwork ] = useState('all')
  const [ events, setEvents ] = useState<string[]>([])

  console.log(events)

  return (
    <div className={styles.ActionButtons}>
      <div className={styles.Filters}>
        <TableDropdownButton
          menu={networksOpt}
          defaultValue={network}
          value={network}
          onChange={(value) => setNetwork(value)}
        />
        <TableDropdownButton
          menu={eventsOpt}
          defaultValue={events}
          value={network}
          label={'Events'}
          multiple
          onChange={(value) => setEvents([ ...events, value ])}
          onDeselect={(value) =>
            setEvents(events.filter((event) => event !== value))
          }
        />
      </div>
      <Button>Download CSV</Button>
    </div>
  )
}

const TxHistoryLayout = () => {
  return (
    <div className={styles.TxHistoryLayout}>
      <ActionButtons />
      <div>
        <TransferRow transferKind='receive' />
        <ClaimRow />
        <TransferRow transferKind='send' />
        <VoteRow voteKind='aye' />
        <VoteRow voteKind='nay' />
        <ClaimRow />
      </div>
    </div>
  )
}

export default TxHistoryLayout
