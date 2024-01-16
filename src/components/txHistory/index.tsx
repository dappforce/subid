import { InfiniteListByData } from '../list'
import styles from './Index.module.sass'
import { getTxHistory } from '@/api/txHistory'
import { TransferRow } from './transactions/Transfer'
import { Transaction } from './types'
import CustomDataList from './CustomDataList'
import { useCallback, useEffect, useRef, useState } from 'react'
import useGetInitialTxHistoryData from './useGetTxHistory'
import { Button, Tooltip } from 'antd'
import { SubDate, isEmptyArray } from '@subsocial/utils'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { MutedDiv } from '../utils/MutedText'
import { useResponsiveSize } from '../responsive'
import ListFilter from './filter/ListFilter'
import EventsIcon from '@/assets/icons/events.svg'
import {
  eventsVariantsOpt,
  // networksVariantsWithIconOpt,
} from './filter/filterItems'
// import { PiShareNetworkLight } from 'react-icons/pi'

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

const supportedNetowrks = ['subsocial']

const TxHistoryLayout = ({ addresses }: TxHistoryLayoutProps) => {
  // const [ networks, setNetworks ] = useState<string[]>([ 'all' ])
  const [events, setEvents] = useState<string[]>(['all'])
  const address = addresses[0]
  const [refresh, setRefresh] = useState(false)
  const { isMobile } = useResponsiveSize()
  const historySection = useRef(null)

  const { initialData, lastUpdateDate } = useGetInitialTxHistoryData({
    address,
    refresh,
    setRefresh,
  })

  const renderItem = (item: Transaction, i: number, dataLength?: number) => {
    const { txKind } = item

    const Component = itemsByTxKind[txKind]

    return (
      <Component
        item={item}
        isLastElement={dataLength ? i === dataLength - 1 : false}
      />
    )
  }

  const dataLoading = isEmptyArray(initialData.txs) && !initialData.actualData

  const List = useCallback(() => {
    return (
      <div className={styles.TransactionsList}>
        <InfiniteListByData
          loadingLabel={
            dataLoading
              ? 'Data is loading for the first time and may take a while. Please wait a moment'
              : 'Loading more transactions...'
          }
          loadMore={(page, size) =>
            loadMore({
              address,
              page,
              size,
              networks: supportedNetowrks.filter((x) => x !== 'all'),
              events: events.filter((x) => x !== 'all'),
            })
          }
          dataLoading={dataLoading}
          dataLoadingClassName={styles.InfiniteListLoading}
          noDataDesc='No transactions yet'
          dataSource={
            supportedNetowrks.includes('all') && events.includes('all')
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
    dataLoading,
    address,
    JSON.stringify(initialData.txs),
    supportedNetowrks.join(','),
    events.join(','),
  ])

  return (
    <div ref={historySection} className={styles.HistoryBlock}>
      <div className={styles.TxHistoryActionBlock}>
        <div className={styles.TxHistoryButtons}>
          <div className={styles.LeftPart}>
            {/* <ListFilter
              menus={networksVariantsWithIconOpt}
              filters={networks}
              setFilters={setNetworks}
              label={'Networks'}
              labelImage={<PiShareNetworkLight />}
            /> */}
            <ListFilter
              menus={eventsVariantsOpt}
              filters={events}
              setFilters={setEvents}
              label={'Events'}
              labelImage={<EventsIcon />}
              scrollPosition={(historySection.current as any)?.offsetTop - 180}
            />
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
          <div className='bs-mt-2 d-flex align-items-center FontNormal'>
            <span className='bs-mr-2'>Last update: </span>
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
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    if (!lastUpdateDate) return

    const intervalId = setInterval(() => {
      setLastUpdate(SubDate.formatDate(lastUpdateDate.getTime()))
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [lastUpdateDate?.getTime()])

  return (
    <Tooltip title='Last update'>
      <div>
        <MutedDiv>
          {refresh || !lastUpdateDate ? 'updating...' : lastUpdate}
        </MutedDiv>
      </div>
    </Tooltip>
  )
}

export default TxHistoryLayout
