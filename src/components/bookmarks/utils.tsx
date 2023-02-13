import { useEffect, useState } from 'react'
import store from 'store'
import { toGenericAccountId } from '../../rtk/app/util'
import { showInfoMessage } from '../utils/Message'
import { Button } from 'antd'
import { TFunction } from 'i18next'
import { ButtonLink } from '../utils/index'

export const FAVORITE_ACCOUNTS = 'FavoriteAccounts'


export const getFavoriteAccountsFromStorage = () => store.get(FAVORITE_ACCOUNTS) as Record<string, string> || {}

export const setFavoriteAccounts = (address: string, desc?: string) => {
  const favoriteAccounts = getFavoriteAccountsFromStorage()

  favoriteAccounts[toGenericAccountId(address)] = desc || ''

  store.set(FAVORITE_ACCOUNTS, favoriteAccounts)
}

export const useGetFavoritesAccounts = (refresh: boolean, stopRefresh: () => void) => {
  const [ favoriteAccounts, setFavoriteAccounts ] = useState<Record<string, string>>({})

  useEffect(() => {
    if (refresh === true) {
      stopRefresh()

      const favoriteAccountsFromStorage = getFavoriteAccountsFromStorage()
      setFavoriteAccounts(favoriteAccountsFromStorage)
    }

  }, [ refresh ])

  return favoriteAccounts
}

type Props = {
  setRefresh?: (refresh: boolean) => void
  account?: string
  desc?: string
  t: TFunction
  withShowInfoButton?: boolean
}

type RemoveFromFavoritesProps = Props & {
  favoriteAccountsFromStorage: Record<string, string>
}

export const showAddOrEditInfoMessage = (t: TFunction, address?: string, isInFavorites?: boolean, withShowButton?: boolean) => {
  showInfoMessage(
    <div className={'d-flex'}>
      {isInFavorites ? t('favoritesAccounts.notifs.edited') : t('favoritesAccounts.notifs.added')}
      {withShowButton && <ButtonLink
        className='NotifButtonAlignment ml-3'
        href={address ? `/${address}/favorites` : '/favorites'}
        target={'_blank'}
      >
        Show
      </ButtonLink>}
    </div>
  )
}

const onUndoClick = ({ account = '', desc, setRefresh, t, withShowInfoButton }: Props) => {
  setFavoriteAccounts(account, desc)
  setRefresh?.(true)
  showAddOrEditInfoMessage(t, account, undefined, withShowInfoButton)
}

export const removeFromFavorites = ({ favoriteAccountsFromStorage, setRefresh, account, desc, t, withShowInfoButton = true }: RemoveFromFavoritesProps) => {
  if (account) {
    delete favoriteAccountsFromStorage[toGenericAccountId(account)]
    store.set(FAVORITE_ACCOUNTS, favoriteAccountsFromStorage)
    setRefresh?.(true)

    showInfoMessage(
      <div className={'d-flex'}>
        {t('favoritesAccounts.notifs.removed')}
        <Button className='ml-3 NotifButtonAlignment' onClick={() => onUndoClick({ account, desc, setRefresh, t, withShowInfoButton })}>Undo</Button>
      </div>)
  }
}

