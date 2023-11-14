import { InfiniteListByData } from '../list'
import styles from './Index.module.sass'
import { getTxHistory } from '@/api/txHistory'
import { TransferRow } from './transactions/Transfer'
import { Transaction } from './types'
import CustomDataList from './CustomDataList'
import { useCallback } from 'react'

const itemsByTxKind: Record<string, any> = {
  TRANSFER_FROM: TransferRow,
  TRANSFER_TO: TransferRow,
}

type LoadMoreProps = {
  address: string
  page: number
  size: number
}

const loadMore = async ({ address, page, size }: LoadMoreProps) => {
  const offset = (page - 1) * size

  const history = await getTxHistory({ address, pageSize: size, offset })

  return history.txs
}

type TxHistoryLayoutProps = {
  addresses: string[]
}

const TxHistoryLayout = ({ addresses }: TxHistoryLayoutProps) => {
  const address = addresses[0]

  const renderItem = (item: Transaction) => {
    const { txKind } = item

    const Component = itemsByTxKind[txKind]

    return <Component item={item} />
  }

  const List = useCallback(() => {
    return (
      <InfiniteListByData
        loadingLabel='Loading more transactions...'
        loadMore={(page, size) => loadMore({ address, page, size })}
        noDataDesc='No transactions yet'
        // dataSource={[initialData]}
        getKey={(data) => data.id}
        renderItem={renderItem}
      >
        {(dataListProps) => {
          return <CustomDataList {...dataListProps} />
        }}
      </InfiniteListByData>
    )
  }, [addresses.join(',')])

  return (
    <div className={styles.HistoryBlock}>
      <List />
    </div>
  )
}

export default TxHistoryLayout
