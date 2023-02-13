import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/store'
import { FeesEntity, feesActions, selectFee } from './feesSlice'
import { TransferFeeParams, generateTransferFeeId } from './utils'

export function useFetchTransferFee (params: TransferFeeParams) {
  const dispatch = useAppDispatch()
  const id = generateTransferFeeId(params)
  const feeEntity = useAppSelector<FeesEntity | undefined>((state) => selectFee(state, id))
  useEffect(() => {
    if (feeEntity?.fee) return
    if (!params.source || !params.token) return
    dispatch(feesActions.fetchTransferFee(params))
  }, [ id ])
  return feeEntity || { id, loading: true }
}
