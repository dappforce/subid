import { sendGetRequest } from './utils'
import { FeeData } from '../rtk/features/fees/feesSlice'

export const getTransferFee = (
  token: string,
  source: string,
  dest?: string
): Promise<FeeData> => (
  sendGetRequest({
    params: {
      url: 'fees/transfer',
      config: { params: { token, from: source, to: dest } }
    },
    onFailReturnedValue: { amount: '0', token: '' },
    onFailedText: `Failed to get transfer token ${token} fee from network ${source} ${
      dest ? 'to network' + dest : ''
    }`
  })
)