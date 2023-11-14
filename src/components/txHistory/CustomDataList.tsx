import React from 'react'
import NoData from 'src/components/utils/EmptyList'
import { DataListProps } from '../list'

function CustomDataList<T extends any>(props: DataListProps<T>) {
  const {
    dataSource,
    renderItem,
    getKey,
    noDataDesc = null,
    noDataExt,
    customNoData,
    beforeList,
  } = props

  const total = dataSource.length

  const hasData = total > 0

  const list = (
    <>
      {beforeList}
      {hasData ? (
        <div>
          {dataSource.map((x, i) => (
            <div key={getKey(x)}>{renderItem(x, i)}</div>
          ))}
        </div>
      ) : (
        customNoData || <NoData description={noDataDesc}>{noDataExt}</NoData>
      )}
    </>
  )

  return list
}

export default CustomDataList
