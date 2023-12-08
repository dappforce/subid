import { BN_ZERO, BN } from '@polkadot/util'
import { AccountInfoByChain } from 'src/components/identity/types'

export const getTransferableBalance = (
  data?: AccountInfoByChain
) => {
  if (!data) return BN_ZERO
  const { freeBalance } = data
  return new BN(freeBalance)
}

export const calculateBalanceForStaking = (
    data?: AccountInfoByChain,
    lockId?: string
) => {
  if (!data) return BN_ZERO
  const { freeBalance, totalBalance, lockedBalance, locks } = data

  const stakingLockedBalance = locks?.find(({ id }) => id === lockId)

  if (!stakingLockedBalance ||
      lockedBalance === stakingLockedBalance?.amount) return totalBalance

  return new BN(totalBalance).sub(new BN(stakingLockedBalance.amount))
}
