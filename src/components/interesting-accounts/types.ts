import { AppDispatch } from '../../rtk/app/store'
import { RelayChain } from '../../types/index'

export type LoadMoreFn = (
  relayChain: string,
  offset: number,
  limit: number
) => Promise<AccountCardType[]>

export type FetchFn = (
  relayChain: string,
  offset: number,
  limit: number
) => Promise<AccountCardType[]>

export type ParsedPaginationQuery = {
  page: number
  size: number
}

export type LoadMoreProps = ParsedPaginationQuery & {
  dispatch: AppDispatch
}

export type AccountCardType = {
  account: string
  relayChain: RelayChain
  type: string
  amount?: string
}
