import {
  dispatchWithGenericAccounts,
  toGenericAccountId,
  toGenericAccountIds,
} from '../../app/util'
import {
  identitiesActions,
  selectIdentities,
  selectManyIdentities,
  AccountIdentitiesRecord,
} from './identitiesSlice'
import { useAppSelector, useAppDispatch } from '../../app/store'
import { AccountIdentities, SubsocialProfile } from '../../../components/identity/types'
import { useEffect } from 'react'

export const fetchIdentities = dispatchWithGenericAccounts(
  identitiesActions.fetchIdentities
)

export const getSubsocialIdentityByAccount = (
  account?: string,
  identities?: AccountIdentitiesRecord
) =>
  identities && account
    ? (identities[toGenericAccountId(account)]?.subsocial as SubsocialProfile)
    : undefined

export const getSubsocialIdentity = (accountiIdentities?: AccountIdentities) => 
  accountiIdentities ? accountiIdentities?.subsocial as SubsocialProfile : undefined

export const getIdentityByAccount = (
  account?: string,
  identities?: AccountIdentitiesRecord
) =>
  identities && account ? identities[toGenericAccountId(account)] : undefined

export const useIdentities = (account?: string) =>
  useAppSelector<AccountIdentities | undefined>(
    (state) => selectIdentities(state, toGenericAccountId(account))?.identity
  )

export const useFetchIdentities = (accounts?: string[]) => {
  const dispatch = useAppDispatch()

  
  useEffect(() => {
    if(!accounts) return

    const genericAccountIds = toGenericAccountIds(accounts)

    dispatch(
      identitiesActions.fetchIdentities({
        accounts: genericAccountIds,
        reload: false,
      })
    )
  }, [ accounts?.join() ])

  
}

export const useIdentitiesByAccounts = (accounts?: string[]) => {
  const genericAccounts = accounts?.map((account) =>
    toGenericAccountId(account)
  )

  return useAppSelector((state) => selectManyIdentities(state, genericAccounts))
}
