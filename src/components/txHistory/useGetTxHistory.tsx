import { useEffect, useRef, useState } from 'react'
import { getTxHistoryQueue } from '../../api/txHistory'
import { Transaction } from './types'

type Txs = {
  txs: Transaction[]
  actualData: boolean
}

const useGetInitialTxHistoryData = (address?: string) => {
  const [ txs, setTxs ] = useState<Txs>({ txs: [], actualData: false })
  let intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (!address) return

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

        return
      }
    }, 1000)

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [ address ])

  return txs || {}
}

export default useGetInitialTxHistoryData
