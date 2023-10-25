import { useStakingContext } from 'src/components/staking/collators/StakingContext'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import BN from 'bignumber.js'

export const useGetNextEraTime = (blockNumber?: string) => {
  const { currentTimestamp, currentBlockNumber, blockTime } = useStakingContext()
  
  if(!currentBlockNumber || !currentTimestamp || !blockTime || !blockNumber) return BIGNUMBER_ZERO
  
  const nextEraTime = new BN(blockNumber)
  .minus(currentBlockNumber)
  .multipliedBy(blockTime)
  .plus(currentTimestamp)
  
  return nextEraTime
}