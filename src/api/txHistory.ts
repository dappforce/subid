import { sendGetRequest } from './utils'

type GetTxHistory = {
  address: string
  pageSize: number
  offset: number
}

export const getTxHistory = async ({
  address,
  pageSize,
  offset,
}: GetTxHistory) =>
  sendGetRequest({
    params: {
      url: 'tx/history',
      config: {
        params: {
          address,
          pageSize,
          offset,
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to get tx history by address ${address}`,
  })
