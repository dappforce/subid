import { createContext, useContext, useEffect, useState } from 'react'
import BN from 'bignumber.js'
import { getBlockData } from './utils'
import { useLazyConnectionsContext } from '../../lazy-connection/LazyConnectionContext'
import { log } from '../../../rtk/app/util'
import { BIGNUMBER_ZERO } from '../../../config/app/consts'

export type StakingContextState = {
  currentBlockNumber?: BN
  blockTime: BN
  currentTimestamp: BN
}

const StakingContext = createContext<StakingContextState>({} as any)

type StakingContextWrapperProps = {
  network: string
}

export const StakingContextWrapper: React.FC<StakingContextWrapperProps> = ({
  children,
  network,
}) => {
  const [ currentBlockNumber, setCurrentBlockNumber ] = useState<BN>(BIGNUMBER_ZERO)
  const [ blockTime, setBlockTime ] = useState<BN>(BIGNUMBER_ZERO)
  const [ currentTimestamp, setCurrentTimestamp ] = useState<BN>(BIGNUMBER_ZERO)

  const { getApiByNetwork } = useLazyConnectionsContext()

  useEffect(() => {
    let isMounted = true
    let unsub: any
    let unsubTimeStamp: any

    const sub = async () => {
      setCurrentBlockNumber(BIGNUMBER_ZERO)
      const api = await getApiByNetwork(network)

      const { blockTime } = await getBlockData(api)

      unsub = await api.query.system.number(async (blockNumber: any) => {
        if (isMounted && blockNumber) {
          setCurrentBlockNumber(new BN(blockNumber.toJSON() as string))
        }
      })

      unsubTimeStamp = await api.query.timestamp.now(async (timestamp: any) => {
        if (isMounted && timestamp) {
          setCurrentTimestamp(new BN(timestamp.toJSON() as string))
        }
      })

      setBlockTime(blockTime)
    }

    isMounted &&
      sub().catch((err) => log.error('Failed to load a pending owner:', err))

    return () => {
      unsub && unsub()
      unsubTimeStamp && unsubTimeStamp()
      isMounted = false
    }
  }, [ network ])

  const value = {
    currentBlockNumber,
    blockTime,
    currentTimestamp,
  }

  return (
    <StakingContext.Provider value={value}>{children}</StakingContext.Provider>
  )
}

export const useStakingContext = () => useContext(StakingContext)
