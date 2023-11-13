import { useCallback } from 'react'
import { InfinitePageList } from '../list'
import styles from './Index.module.sass'
import useGetTxHistory from './useGetTxHistory'

const loadMore = async () => {
  console.log('loadMore')

  return []
}

type TxHistoryLayoutProps = {
  addresses: string[]
}

const TxHistoryLayout = ({ addresses }: TxHistoryLayoutProps) => {
  const address = addresses[0]
  const { txs, actualData } = useGetTxHistory(address)

  console.log(txs, actualData)

  const renderItem = () => {
    return (
      <div>
        <div>renderItem</div>
      </div>
    )
  }

  const List = useCallback(() => {

    return (
      <InfinitePageList
        withLoadMoreLink
        loadingLabel='Loading more accounts...'
        loadMore={(page, size) => loadMore()}
        totalCount={60}
        dataSource={txs}
        noDataDesc='No spaces yet'
        getKey={(account: any) => account.account}
        isCards
        renderItem={renderItem}
      />
    )
  }, [ txs.length ])

  return (
    <div className={styles.HistoryBlock}>
      <List />
    </div>
  )
}

export default TxHistoryLayout
