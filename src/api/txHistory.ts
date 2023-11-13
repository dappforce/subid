import { sendGetRequest } from './utils'

export const getTxHistory = async (address: string) =>
  sendGetRequest({
    params: {
      url: 'tx/history',
      config: {
        params: {
          address,
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to get tx history by address ${address}`,
  })
