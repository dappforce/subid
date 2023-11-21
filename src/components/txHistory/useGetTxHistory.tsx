import { useEffect, useRef, useState } from 'react'
import { getTxHistoryQueue } from '../../api/txHistory'
import { Transaction } from './types'

type InitialData = {
  txs: Transaction[]
  actualData: boolean
}

type GetIniTitalTxHistoryDataProps = {
  address?: string
  refresh: boolean
  setRefresh: (refresh: boolean) => void
}

const defaultInitialData = { txs: [], actualData: false }

const useGetInitialTxHistoryData = ({
  address,
  refresh,
  setRefresh,
}: GetIniTitalTxHistoryDataProps) => {
  let intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [ initialData, setInitialData ] =
    useState<InitialData>(defaultInitialData)
  const [ lastUpdateDate, setLastUpdateDate ] = useState<Date | undefined>(
    undefined
  )

  useEffect(() => {
    setInitialData(defaultInitialData)
    setRefresh(true)
  }, [ address ])

  useEffect(() => {
    if (!address || !refresh) return

    intervalRef.current = setInterval(async () => {
      const history: InitialData = await getTxHistoryQueue({
        address,
        offset: 0,
        pageSize: 30,
      })

      setInitialData(history)
      if (history?.actualData) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
        setRefresh(false)
        setLastUpdateDate(new Date())

        return
      }
    }, 2000)

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [ address, refresh ])

  return { initialData: initialData || {}, lastUpdateDate }
}

export default useGetInitialTxHistoryData
