import { sendGetRequest } from './utils'

type GetTxHistoryQueue = {
  address: string
  pageSize: number
  offset: number
}

export const getTxHistoryQueue = async ({
  address,
  pageSize,
  offset,
}: GetTxHistoryQueue) =>
  sendGetRequest({
    params: {
      url: 'tx/history/queue',
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

type GetTxHistory = GetTxHistoryQueue & {
  networks: string[]
  events: string[]
}

export const getTxHistory = async ({
  address,
  pageSize,
  offset,
  networks,
  events,
}: GetTxHistory) =>
  sendGetRequest({
    params: {
      url: 'tx/history',
      config: {
        params: {
          address,
          pageSize,
          offset,
          networks,
          events,
        },
      },
    },
    onFailReturnedValue: undefined,
    onFailedText: `Failed to get tx history by address ${address}`,
  })
