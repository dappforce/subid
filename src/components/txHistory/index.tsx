import { InfiniteListByData } from '../list'
import styles from './Index.module.sass'
import { getTxHistory } from '@/api/txHistory'
import { TransferRow } from './transactions/Transfer'
import { Transaction } from './types'
import CustomDataList from './CustomDataList'
import { useCallback, useEffect, useState } from 'react'
import useGetInitialTxHistoryData from './useGetTxHistory'
import NetworkSelector from './actionButtons/NetworkSelector'
import { Button } from 'antd'
import EventSelector from './actionButtons/EventsSelector'
import { SubDate, isEmptyArray } from '@subsocial/utils'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { MutedSpan } from '../utils/MutedText'
import { useResponsiveSize } from '../responsive'

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
  const [ refresh, setRefresh ] = useState(false)
  const { isMobile } = useResponsiveSize()

  const { initialData, lastUpdateDate } = useGetInitialTxHistoryData({
    address,
    refresh,
    setRefresh,
  })

  const renderItem = (item: Transaction) => {
    const { txKind } = item

    const Component = itemsByTxKind[txKind]

    return <Component item={item} />
  }

  const List = useCallback(() => {
    return (
      <div className={styles.TransactionsList}>
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
          dataLoading={isEmptyArray(initialData.txs) && !initialData.actualData}
          dataLoadingClassName={styles.InfiniteListLoading}
          noDataDesc='No transactions yet'
          dataSource={
            networks.includes('all') && events.includes('all')
              ? initialData.txs
              : undefined
          }
          getKey={(data) => data.id}
          renderItem={renderItem}
        >
          {(dataListProps) => {
            return <CustomDataList {...dataListProps} />
          }}
        </InfiniteListByData>
      </div>
    )
  }, [
    address,
    JSON.stringify(initialData.txs),
    networks.join(','),
    events.join(','),
  ])

  return (
    <div className={styles.HistoryBlock}>
      <div className={styles.TxHistoryActionBlock}>
        <div className={styles.TxHistoryButtons}>
          <div className={styles.LeftPart}>
            <NetworkSelector networks={networks} setNetworks={setNetworks} />
            <EventSelector events={events} setEvents={setEvents} />
          </div>
          <div className={styles.RightPart}>
            {!isMobile && (
              <LastUpdate lastUpdateDate={lastUpdateDate} refresh={refresh} />
            )}
            <Button
              onClick={() => setRefresh(true)}
              disabled={
                (isEmptyArray(initialData.txs) && !initialData.actualData) ||
                refresh
              }
              shape='circle'
            >
              {refresh ? <LoadingOutlined /> : <ReloadOutlined />}
            </Button>
          </div>
        </div>
        {isMobile && (
          <div className='bs-mt-2 FontNormal'>
            <span>Last update: </span>
            <LastUpdate lastUpdateDate={lastUpdateDate} refresh={refresh} />
          </div>
        )}
      </div>

      <List />
    </div>
  )
}

type LastUpdateProps = {
  lastUpdateDate?: Date
  refresh: boolean
}

const LastUpdate = ({ lastUpdateDate, refresh }: LastUpdateProps) => {
  const [ lastUpdate, setLastUpdate ] = useState<string | null>(null)

  useEffect(() => {
    if (!lastUpdateDate) return

    const intervalId = setInterval(() => {
      setLastUpdate(SubDate.formatDate(lastUpdateDate.getTime()))
    }, 1000)

    return () => {
      console.log('clear interval')
      clearInterval(intervalId)
    }
  }, [ lastUpdateDate?.getTime() ])

  return (
    <MutedSpan>
      {refresh || !lastUpdateDate ? 'updating...' : lastUpdate}
    </MutedSpan>
  )
}

export default TxHistoryLayout
