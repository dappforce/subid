import { getBackendUrl, sendRequest } from './utils'
import { AccountCardType } from '../../interesting-accounts/types'
import axios from 'axios'
import { isDef } from '@subsocial/utils'

const getAccountsApiUrl = (suburl: string) =>
  `${getBackendUrl('accounts')}/${suburl}`

export const getValidatorsByChain = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  const res = await sendRequest({
    request: () => axios.get(getAccountsApiUrl(`${relayChain}/validators`), {
      params: { offset, limit },
    }),
    onFaileReturnedValue: [],
    onFailedText: 'Failed to get validators by relay chain'
  })

  return (res || []).filter(isDef)
}

export const getAllInterestingAccounts = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  const res = await sendRequest({
    request: () => axios.get(getAccountsApiUrl(`all/${relayChain}`), {
      params: { offset, limit },
    }),
    onFaileReturnedValue: [],
    onFailedText: 'Failed to get all interesting accounts'
  })

  return (res || []).filter(isDef)
}

export const getAllAccountsLength = async (): Promise<number> => {
  const res = await sendRequest({
    request: () => axios.get(getAccountsApiUrl('length')),
    onFaileReturnedValue: 0,
    onFailedText: 'Failed to get all accounts length'
  })

  return res || 0 
}

export const getAccountsOverviewItems = async (): Promise<
  AccountCardType[]
> => {
  const res = await sendRequest({
    request: () => axios.get(getAccountsApiUrl('overview')),
    onFaileReturnedValue: [],
    onFailedText: 'Failed to get overview items for accounts'
  })

  return (res || []).filter(isDef)
}

export const getCouncilMembersByChain = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  const res = await sendRequest({
    request: () => axios.get(getAccountsApiUrl(`${relayChain}/council`), {
      params: { offset, limit },
    }),
    onFaileReturnedValue: [],
    onFailedText: 'Failed to get council members'
  })

  return (res || []).filter(isDef)
}

export const getCrowdloanContributorsByChain = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  const res = await sendRequest({
    request: () => axios.get(
      getAccountsApiUrl(`${relayChain}/contributors`),
      { params: { offset, limit } }
    ),
    onFaileReturnedValue: [],
    onFailedText: 'Failed to get validators info'
  })

  return (res || []).filter(isDef)
}
