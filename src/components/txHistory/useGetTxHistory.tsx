import { useEffect, useState } from 'react'
import { getTxHistory } from '../../api/txHistory'

type Txs = {
  txs: any[]
  actualData: boolean
}

const useGetTxHistory = (address?: string) => {
  const [txs, setTxs] = useState<Txs>({ txs: [], actualData: false })

  useEffect(() => {
    if (!address) return

    const getHistory = async () => {
      const history = await getTxHistory(address)

      setTxs(history)
    }

    getHistory()
  }, [address])

  return txs
}

export default useGetTxHistory
