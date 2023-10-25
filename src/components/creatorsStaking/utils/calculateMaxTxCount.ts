import { ApiPromise } from '@polkadot/api'
import { BIGNUMBER_ZERO } from '../../../config/app/consts'
import BN from 'bignumber.js'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types'

const calculateMaxTxCountInBatch = async (
  api: ApiPromise,
  tx: SubmittableExtrinsic,
  myAddress: string
) => {
  const blockWeight = api.consts.system.blockWeights.toJSON() as any

  if (blockWeight) {
    const avaliableWeight = blockWeight.perClass.normal.maxExtrinsic.refTime

    const maxAvaliableWeight = avaliableWeight
      ? new BN(avaliableWeight).multipliedBy(0.5)
      : BIGNUMBER_ZERO

    const claimPaymentInfo = await tx.paymentInfo(myAddress)

    const { weight } = claimPaymentInfo.toJSON() as any
    const extrinsicWeight = weight.refTime

    return extrinsicWeight && maxAvaliableWeight
      ? new BN(maxAvaliableWeight).dividedBy(extrinsicWeight)
      : BIGNUMBER_ZERO
  }

  return
}

export default calculateMaxTxCountInBatch
