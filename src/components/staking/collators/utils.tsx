import BN from 'bignumber.js'
import { useStakingContext } from './StakingContext'
import { SubDate } from '@subsocial/utils'
import { ApiPromise } from '@polkadot/api'
import styles from './Staking.module.sass'
import { Skeleton } from 'antd'
import { useEffect } from 'react'
import { Round } from '../../../rtk/features/stakingRound/types'
import { useStakingRoundByNetwork } from '../../../rtk/features/stakingRound/stakingRoundHooks'
import { useAppDispatch } from '../../../rtk/app/store'
import { stakingRoundActions } from '../../../rtk/features/stakingRound/stakingRoundSlice'
import { BIGNUMBER_ZERO, BIGNUMBER_ONE } from '../../../config/app/consts'

type GetNextRoundDateProps = {
  blockNumber?: BN
  blockTime: BN
  currentTimestamp: BN
  round?: Round
  whenExecutable?: number
}

export const getNextRoundDate = ({
  blockNumber,
  blockTime,
  round,
  currentTimestamp,
  whenExecutable,
}: GetNextRoundDateProps) => {
  if (!blockNumber || !round) return BIGNUMBER_ZERO

  const { current, first, length } = round

  const currentBN = new BN(current)

  const numberOfRound = whenExecutable
    ? new BN(whenExecutable.toString()).minus(currentBN)
    : BIGNUMBER_ONE
  const blocksInRound = new BN(first)
    .plus(numberOfRound.multipliedBy(new BN(length)))
    .minus(blockNumber)

  return currentTimestamp.plus(blocksInRound.multipliedBy(blockTime))
}

type NextRoundStartDateProps = {
  network: string
}

export const NextRoundStartDate = ({ network }: NextRoundStartDateProps) => {
  const { currentBlockNumber, blockTime, currentTimestamp } =
    useStakingContext()
  const round = useStakingRoundByNetwork(network)
  const dispatch = useAppDispatch()

  const nextRoundDate = getNextRoundDate({
    blockNumber: currentBlockNumber,
    blockTime,
    currentTimestamp,
    round,
  })

  const currentDate = new Date().getTime()

  useEffect(() => {
    dispatch(stakingRoundActions.fetchStakingRound(network))
  }, [ currentDate >= nextRoundDate.plus(3000).toNumber() ])

  if (!round || !currentBlockNumber) return <>-</>

  return (
    <div>
      {currentBlockNumber.isZero() ||
      new BN(currentDate.toString()).gt(nextRoundDate) ? (
        <Skeleton paragraph={{ rows: 0 }} className={styles.TimeSkeleton} />
      ) : (
        SubDate.formatDate(nextRoundDate.toNumber())
      )}
    </div>
  )
}

export const getBlockData = async (api: ApiPromise) => {
  const period = '6000'

  const blockTime = new BN(period).multipliedBy(2)
  const currentTimestamp = await api.query.timestamp.now()

  return {
    blockTime,
    currentTimestamp,
  }
}
