import { sendGetRequest } from './utils'
import { isDef } from '@subsocial/utils'
import { AccountCardType } from '../components/interesting-accounts/types'

const getAccountsApiUrl = (suburl: string) =>
  `accounts/${suburl}`

export const getValidatorsByChain = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  const res = await sendGetRequest({
    params: {
      url: getAccountsApiUrl(`${relayChain}/validators`),
      config: { params: { offset, limit } }
    },
    onFailReturnedValue: [],
    onFailedText: 'Failed to get validators by relay chain'
  })

  return (res || []).filter(isDef)
}

export const getAllInterestingAccounts = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  const res = await sendGetRequest({
    params: {
      url: getAccountsApiUrl(`all/${relayChain}`),
      config: {
        params: { offset, limit },
      }
    },
    onFailReturnedValue: [],
    onFailedText: 'Failed to get all interesting accounts'
  })

  return (res || []).filter(isDef)
}

export const getAllAccountsLength = async (): Promise<number> => {
  const res = await sendGetRequest({
    params: { url: getAccountsApiUrl('length') },
    onFailReturnedValue: 0,
    onFailedText: 'Failed to get all accounts length'
  })

  return res || 0 
}

export const getAccountsOverviewItems = async (): Promise<
  AccountCardType[]
> => {
  const res = await sendGetRequest({
    params: { url: getAccountsApiUrl('overview') },
    onFailReturnedValue: [],
    onFailedText: 'Failed to get overview items for accounts'
  })

  return (res || []).filter(isDef)
}

export const getCouncilMembersByChain = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  const res = await sendGetRequest({
    params: {
      url: getAccountsApiUrl(`${relayChain}/council`),
      config: { params: { offset, limit } }
    },
    onFailReturnedValue: [],
    onFailedText: 'Failed to get council members'
  })

  return (res || []).filter(isDef)
}

export const getCrowdloanContributorsByChain = async (
  relayChain: string,
  offset: number,
  limit: number
): Promise<AccountCardType[]> => {
  const res = await sendGetRequest({
    params: {
      url: getAccountsApiUrl(`${relayChain}/contributors`),
      config: { params: { offset, limit } }
    },
    onFailReturnedValue: [],
    onFailedText: 'Failed to get validators info'
  })

  return (res || []).filter(isDef)
}
