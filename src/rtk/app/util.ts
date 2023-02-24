import { AnyAction } from 'redux'
import { isEmptyArray, isEmptyObj, newLogger, isDef } from '@subsocial/utils'
import { Dispatch } from 'react'
import { useFetchBalances } from '../features/balances/balancesHooks'
import { fetchIdentities } from '../features/identities/identitiesHooks'
import { useFetchNfts } from '../features/nfts/nftsHooks'
import { useFetchAssetsBalances } from '../features/assetsBalances/assetsBalancesHooks'
import { useDotsamaContributions } from '../features/contributions/contributionsHooks'
import { relayChains } from '../../components/table/utils'
import { isValidAddress } from '../../components/utils/index'
import { GenericAccountId } from '@polkadot/types'
import registry from '@subsocial/types/substrate/registry'
import {
  FETCH_CHIAN_INFO_WITH_PRICES,
  FETCH_DOTSAMA_CROWDLOAN_INFO,
} from './actions'
import { AssetBalance } from '../features/assetsBalances/types'
import {
  AccountInfoItem,
  AccountIdentities,
} from '../../components/identity/types'
import { Contribution } from '../features/contributions/types'
import { Nfts } from '../features/nfts/types'
import { EntityAdapter, EntitySelectors, EntityState } from '@reduxjs/toolkit'
import { ContributionsEntity } from '../features/contributions/contributionsSlice'
import { BalancesEntity } from '../features/balances/balancesSlice'
import { AssetsBalancesEntity } from '../features/assetsBalances/assetsBalancesSlice'
import { IdentitiesEntity } from '../features/identities/identitiesSlice'
import { NftsEntity } from '../features/nfts/nftsSlice'
import {
  getAllInterestingAccounts,
  getOwnerByDomain,
  getAllAccountsLength,
} from 'src/api'
import { fetchOverviewAccounts } from '../features/interestingAccounts/interestingAccountsHooks'
import { shuffle } from 'lodash'
import { currentAccountActions } from '../features/accounts/currentAccountSlice'
import { isEthereumAddress } from '@polkadot/util-crypto'
import { DEFAULT_PAGE_SIZE } from '../../components/list/ListData.config'
import { StakingCandidatesInfoEntity } from '../features/stakingCandidates/candidatesInfo/stakingCandidatesInfoSlice'
import { VestingEntity } from '../features/vesting/vestingSlice'
import { FeesEntity } from '../features/fees/feesSlice'

export const toGenericAccountId = (account?: string) => {
  if (account && isEthereumAddress(account)) return account

  return account && isValidAddress(account)
    ? new GenericAccountId(registry, account).toString()
    : ''
}

export const toGenericAccountIds = (accounts: string[]) =>
  accounts.map((account) => toGenericAccountId(account))

type Entities =
  | AssetBalance
  | AccountInfoItem[]
  | Contribution
  | Nfts
  | AccountIdentities

export const isEmptyEntity = <T extends Entities>(entity?: T) =>
  !entity && isEmptyObj(entity)

export const log = newLogger('FetchEntities')

export type FetchProps = {
  accounts: string[]
  reload?: boolean
}

export function dispatchWithGenericAccounts (
  fn: ({ accounts, reload }: FetchProps) => AnyAction
) {
  return (
    dispatch: Dispatch<AnyAction>,
    accounts: string[],
    reload?: boolean
  ) => {
    const genericAccounts = toGenericAccountIds(accounts)

    dispatch(fn({ accounts: genericAccounts, reload }))
  }
}

export const fetchData = (dispatch: Dispatch<AnyAction>) => {
  dispatch({ type: FETCH_CHIAN_INFO_WITH_PRICES })
  fetchOverviewAccounts(dispatch)
  dispatch({
    type: FETCH_DOTSAMA_CROWDLOAN_INFO,
    payload: relayChains,
  })
}

export const getInitialAccoutsData = async () => {
  const initialAccounts = await getInterestingAccounts(0, DEFAULT_PAGE_SIZE)
  const accountsLength = await getAllAccountsLength()

  return { initialAccounts, accountsLength }
}

export const getInterestingAccounts = async (offset: number, limit: number) => {
  const allAccountsPromise = relayChains.map(async (relayChain) =>
    getAllInterestingAccounts(relayChain, offset, limit)
  )

  const allAccounts = await Promise.all(allAccountsPromise)

  return shuffle(allAccounts.flat())
}

/** Fetch info by account: balances, identities, crowdloan contributions, assets balances, NFTs. */
export const fetchDataByAccount = async (
  dispatch: Dispatch<AnyAction>,
  accounts: string[],
  reload: boolean,
  withSetCurrentAccount?: boolean
) => {
  const addresses = await getAddressesByDomain(accounts)

  if (addresses && !isEmptyArray(addresses.filter(x => x))) {
    if (withSetCurrentAccount) {
      dispatch({
        type: currentAccountActions.setAccount.type,
        payload: toGenericAccountIds(addresses).join(','),
      })
    }

    fetchIdentities(dispatch, addresses, reload)
  }
}

export const useFetchDataByAddresses = () => {
  useFetchBalances()
  useFetchAssetsBalances()
  useFetchNfts()
  useDotsamaContributions()
}

export function stubFn () {
  return
}

export function hydrateExtraReducer (entity: string) {
  return (_state: any, action: AnyAction) => {
    return {
      ...action.payload[entity],
    }
  }
}

type UpsertOneEntity<T> = {
  adapter: EntityAdapter<T>
  state: EntityState<T>
  reload?: boolean
  id: string
  loading?: boolean
  fieldName: string
  entity?: T
}

type UpsertedEntities =
  | ContributionsEntity
  | BalancesEntity
  | AssetsBalancesEntity
  | IdentitiesEntity
  | NftsEntity
  | StakingCandidatesInfoEntity
  | VestingEntity
  | FeesEntity

export const upsertOneEntity = <T extends UpsertedEntities>({
  adapter,
  state,
  reload,
  loading = true,
  id,
  fieldName,
  entity,
}: UpsertOneEntity<T>) => {
  if (reload || entity?.loading === undefined) {
    const updatedBalance = entity
      ? { ...entity, loading }
      : { id, loading, [fieldName]: undefined }

    adapter.upsertOne(state, updatedBalance as T)
  }
}

type UpsertManyEntity<T> = Omit<UpsertOneEntity<T>, 'entity' | 'id'> & {
  accounts: string[]
  selector: EntitySelectors<T, EntityState<T>>
  network?: string
}

export const upsertManyEntity = <T extends UpsertedEntities>({
  adapter,
  state,
  reload,
  loading = true,
  fieldName,
  accounts,
  selector,
  network
}: UpsertManyEntity<T>) => {

  const entities = accounts.map((account) => {
    const entity = selector.selectById(state, account)

    if (reload || entity?.loading === undefined) {
      const newEntity = entity
        ? { ...entity, loading }
        : { id: network ? `${account}-${network}` : account, loading, [fieldName]: undefined }
      
      return newEntity
    }

    return
  })

  adapter.upsertMany(state, entities.filter(isDef) as T[])
}

export const getAddressesByDomain = async (addressesOrDomains?: string[]) => {
  if (!addressesOrDomains) return
  const addressesPromise = addressesOrDomains.map(async (addressOrDomain) => {
    if (!isValidAddress(addressOrDomain)) {
      const domain =
      addressOrDomain.split('.').length > 1
      ? addressOrDomain
      : addressOrDomain + '.sub'
      
      const owner = await getOwnerByDomain(domain)
      return owner?.owner || addressOrDomain
    }

    return addressOrDomain
  })

  const addresses = await Promise.all(addressesPromise)

  return addresses
}

export const getAccountsThatNeedToFetch = (obj: any, accounts: string[], field?: string) => {
  return !isEmptyObj(obj)
    ? Object.entries(obj).map(([ key, value ]) => {
      const objValue = field ? (value as any)[field] : value

      if (!objValue || isEmptyObj(objValue)) {
        return key
      }

      return
    }).filter(isDef) 
    : accounts
}