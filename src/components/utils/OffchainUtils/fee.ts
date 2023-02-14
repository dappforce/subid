import { FeeData } from '../../../rtk/features/fees/feesSlice'
import { getBackendUrl, sendRequest } from './utils'
import axios from 'axios'

export const getTransferFee = (
  token: string,
  source: string,
  dest?: string
): Promise<FeeData> => (
  sendRequest({
    request: () => axios.get(getBackendUrl('fees/transfer'), {
      params: { token, from: source, to: dest },
    }),
    onFaileReturnedValue: { amount: '0', token: '' },
    onFailedText: `Failed to get transfer token ${token} fee from network ${source} ${
      dest ? 'to network' + dest : ''
    }`
  })
)