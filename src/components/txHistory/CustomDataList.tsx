import React from 'react'
import NoData from 'src/components/utils/EmptyList'
import { DataListProps } from '../list'
import { groupBy } from 'lodash'
import { Transaction } from './types'
import styles from './Index.module.sass'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'

dayjs.extend(utc)

function CustomDataList (props: DataListProps<Transaction>) {
  const {
    dataSource,
    renderItem,
    getKey,
    noDataDesc = null,
    noDataExt,
    customNoData,
  } = props

  const total = dataSource.length

  const hasData = total > 0

  const groupedData = groupBy(dataSource, (x) =>
    dayjs(x.timestamp).utc(false).format('MMMM D, YYYY')
  )

  if (!hasData) {
    return (
      <>
        {customNoData || <NoData description={noDataDesc}>{noDataExt}</NoData>}
      </>
    )
  }

  return (
    <div className={styles.GroupedData}>
      {Object.entries(groupedData).map(([ date, item ], i) => {
        return (
          <div key={date + i}>
            <div className={styles.Date}>{date}</div>
            <div className={styles.TransactionByDateContainer}>
              {item.map((x, i) => (
                <div key={getKey(x)}>{renderItem(x, i, item.length)}</div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CustomDataList
