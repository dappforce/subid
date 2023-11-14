import React from 'react'
import NoData from 'src/components/utils/EmptyList'
import { DataListProps } from '../list'
import { groupBy } from 'lodash'
import { Transaction } from './types'
import styles from './Index.module.sass'

function CustomDataList(props: DataListProps<Transaction>) {
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

  const groupedData = groupBy(dataSource, (x) => {
    const date = new Date(x.timestamp)

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  if (!hasData) {
    return (
      <>
        {customNoData || <NoData description={noDataDesc}>{noDataExt}</NoData>}
      </>
    )
  }

  return (
    <div className={styles.GroupedData}>
      {Object.entries(groupedData).map(([date, item], i) => {
        return (
          <div key={date + i}>
            <div className={styles.Date}>{date}</div>
            {item.map((x, i) => (
              <div key={getKey(x)}>{renderItem(x, i)}</div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default CustomDataList
