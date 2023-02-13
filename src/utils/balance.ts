import BN from 'bn.js'
import { BN_ZERO } from '@polkadot/util'
import { AccountInfoByChain } from 'src/components/identity/types'

export const getTransferableBalance = (data: AccountInfoByChain | undefined) => {
  if (!data) return BN_ZERO
  const { freeBalance, frozenMisc, frozenFee } = data
  return new BN(freeBalance).sub(new BN(frozenMisc || frozenFee || BN_ZERO))
}
