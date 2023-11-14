import { useEffect, useState } from 'react'
import { getTxHistory } from '../../api/txHistory'
import { Transaction } from './types';

type Txs = {
  txs: Transaction[]
  actualData: boolean
}

const useGetInitialTxHistoryData = (address?: string) => {
  const [txs, setTxs] = useState<Txs>({ txs: [], actualData: false })

  useEffect(() => {
    if (!address) return

    const getHistory = async () => {
      const history = await getTxHistory({ address, pageSize: 30, offset: 0})

      setTxs(history)
    }

    getHistory()
  }, [address])

  return txs || {}
}

export default useGetInitialTxHistoryData
