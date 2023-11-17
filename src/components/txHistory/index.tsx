import { InfiniteListByData } from '../list'
import styles from './Index.module.sass'
import { getTxHistory } from '@/api/txHistory'
import { TransferRow } from './transactions/Transfer'
import { Transaction } from './types'
import CustomDataList from './CustomDataList'
import { useCallback, useState } from 'react'
import useGetInitialTxHistoryData from './useGetTxHistory'
import NetworkSelector from './actionButtons/NetworkSelector'
import { Button } from 'antd'
import { LabelWithIcon } from '../table/balancesTable/utils'
import { GrDownload } from 'react-icons/gr'
import EventSelector from './actionButtons/EventsSelector'

const itemsByTxKind: Record<string, any> = {
  TRANSFER_FROM: TransferRow,
  TRANSFER_TO: TransferRow,
}

type LoadMoreProps = {
  address: string
  page: number
  size: number
  networks: string[]
  events: string[]
}

const loadMore = async ({
  address,
  page,
  size,
  networks,
  events,
}: LoadMoreProps) => {
  const offset = (page - 1) * size

  const history = await getTxHistory({
    address,
    pageSize: size,
    offset,
    networks,
    events,
  })

  return history
}

type TxHistoryLayoutProps = {
  addresses: string[]
}

const TxHistoryLayout = ({ addresses }: TxHistoryLayoutProps) => {
  const [ networks, setNetworks ] = useState<string[]>([ 'all' ])
  const [ events, setEvents ] = useState<string[]>([ 'all' ])
  const address = addresses[0]

  const initialData = useGetInitialTxHistoryData(address)

  const renderItem = (item: Transaction) => {
    const { txKind } = item

    const Component = itemsByTxKind[txKind]

    return <Component item={item} />
  }

  const List = useCallback(() => {
    return (
      <>
        <InfiniteListByData
          loadingLabel='Loading more transactions...'
          loadMore={(page, size) =>
            loadMore({
              address,
              page,
              size,
              networks: networks.filter((x) => x !== 'all'),
              events: events.filter((x) => x !== 'all'),
            })
          }
          noDataDesc='No transactions yet'
          dataSource={networks.includes('all') && events.includes('all') ? initialData.txs : undefined}
          getKey={(data) => data.id}
          renderItem={renderItem}
        >
          {(dataListProps) => {
            return <CustomDataList {...dataListProps} />
          }}
        </InfiniteListByData>
      </>
    )
  }, [
    address,
    JSON.stringify(initialData.txs),
    networks.join(','),
    events.join(','),
  ])

  return (
    <div className={styles.HistoryBlock}>
      <div className={styles.TxHistoryActionButtons}>
        <div className={styles.LeftPart}>
          <NetworkSelector networks={networks} setNetworks={setNetworks} />
          <EventSelector events={events} setEvents={setEvents} />
        </div>
        <div className={styles.RightPart}>
          <Button>
            <LabelWithIcon label={'Download CSV'} iconSrc={<GrDownload />} />
          </Button>
        </div>
      </div>

      <List />
    </div>
  )
}

export default TxHistoryLayout
