import { useEffect, useRef, useState } from 'react'
import { getTxHistoryQueue } from '../../api/txHistory'
import { Transaction } from './types'

type Txs = {
  txs: Transaction[]
  actualData: boolean
}

type GetIniTitalTxHistoryDataProps = {
  address?: string
  refresh: boolean
  setRefresh: (refresh: boolean) => void
}

const useGetInitialTxHistoryData = ({
  address,
  refresh,
  setRefresh,
}: GetIniTitalTxHistoryDataProps) => {
  const [txs, setTxs] = useState<Txs>({ txs: [], actualData: false })
  let intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => setRefresh(true), [address])

  useEffect(() => {
    if (!address || !refresh) return

    intervalRef.current = setInterval(async () => {
      const history: Txs = await getTxHistoryQueue({
        address,
        offset: 0,
        pageSize: 30,
      })

      setTxs(history)
      if (history.actualData) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
        setRefresh(false)

        return
      }
    }, 1000)

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [address, refresh])


  return txs || {}
}

export default useGetInitialTxHistoryData
