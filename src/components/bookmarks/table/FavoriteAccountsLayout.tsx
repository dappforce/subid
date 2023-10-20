import { Table, Button, Divider, Tooltip } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import styles from './Table.module.sass'
import { EditOutlined, StarFilled } from '@ant-design/icons'
import { useIdentitiesByAccounts, getSubsocialIdentityByAccount } from '../../../rtk/features/identities/identitiesHooks'
import { AccountPreview } from 'src/components/table/utils'
import BookmarksModal from '../BokmarksModal'
import { useState } from 'react'
import { useGetFavoritesAccounts, removeFromFavorites } from '../utils'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import clsx from 'clsx'
import { isEmptyArray } from '@subsocial/utils'
import NoData from 'src/components/utils/EmptyList'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { PageTitle } from '../../utils/index'

const getColumns = (t: TFunction): ColumnsType<any> => [
  {
    dataIndex: 'star',
    align: 'center',
    className: clsx(styles.ActionButton, 'pr-0')
  },
  {
    title: t('favoritesAccounts.table.account'),
    dataIndex: 'account',
    className: styles.AccountRowWidth
  },
  {
    title: t('favoritesAccounts.table.notes'),
    dataIndex: 'notes',
    align: 'right',
    className: styles.LabelRowWidth
  },
  {
    dataIndex: 'edit',
    align: 'center',
    className: clsx(styles.ActionButton, 'pl-0')
  },
]

type FacoritesAccountData = {
  key: string
  star: React.ReactNode
  account: React.ReactNode
  notes: React.ReactNode
  edit: React.ReactNode
}

type FavoriteAccountsCars = {
  data: FacoritesAccountData[]
}

const FavoriteAccountsCards = ({ data }: FavoriteAccountsCars) => {
  const cards = data.map(({ key, star, account, notes, edit }, i) => (
    <a href={`/${key}`} className={styles.CardLink} key={key} target='_blank' rel='noreferrer'>
      <div className='d-flex align-items-center justify-content-between'>
        {account}
        <div className='d-flex'>
          <div>{edit}</div>
          <div>{star}</div>
        </div>
      </div>
      <div className={styles.Label}>{notes}</div>
      {i + 1 !== data.length && <Divider className='bs-mt-2 bs-mb-2' />}
    </a>
  ))

  return <div className={styles.CardsSection}>{cards}</div>
}

const FavoriteAccountsLayout = () => {
  const { isMobile } = useResponsiveSize()
  const { t } = useTranslation()
  const [ refresh, setRefresh ] = useState<boolean>(true)
  const favoriteAccounts = useGetFavoritesAccounts(refresh, () => setRefresh(false))

  const favoriteAccoutnsEntries = Object.entries(favoriteAccounts)
  const favoriteAccountsKeys = Object.keys(favoriteAccounts)

  const identitiesByAccounts = useIdentitiesByAccounts(favoriteAccountsKeys)

  const data = favoriteAccoutnsEntries.map(([ account, desc ]) => {
    const subsocialIdentity = getSubsocialIdentityByAccount(account, identitiesByAccounts)

    const onAddButtonClick = () => {
      setRefresh(true)
    }

    const onStarClick = (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      e.preventDefault()

      removeFromFavorites({ favoriteAccountsFromStorage: favoriteAccounts, setRefresh, account, t, withShowInfoButton: false })
    }

    return {
      key: account,
      star: <Tooltip title={t('favoritesAccounts.tooltips.star')}>
        <Button
          type='link'
          onClick={onStarClick}
          className={styles.TableButton}
        >
          <StarFilled className='BookmarkStar ActiveStar' />
        </Button>
      </Tooltip>,
      account: <AccountPreview
        withCopy={false}
        account={account}
        avatar={subsocialIdentity?.image}
        withQr={false}
        largeAvatar
      />,
      notes: <div className='d-flex align-item-center justify-content-end'>
        <div className='text-left'>{desc}</div>
      </div>,
      edit: <BookmarksModal
        actionButtonIcon={<EditOutlined className='BookmarkStar' />}
        address={account}
        additionalAddFn={onAddButtonClick}
        buttonType='link'
        notes={desc}
        buttonClassName={clsx(styles.TableButton, styles.EditBookmark)}
      />
    }
  })

  return <div className={clsx({ ['bs-ml-3 bs-mr-3']: isMobile })}>
    <PageTitle 
      title={t('favoritesAccounts.title')}
      desc={t('favoritesAccounts.pageDesc')}
    />
    {isEmptyArray(data)
      ? <div className={styles.CardsSection}><NoData description='No Favorite Accounts' /></div>
      : <>
        {isMobile
          ? <FavoriteAccountsCards data={data} />
          : <Table
            columns={getColumns(t)}
            dataSource={data}
            className={styles.FavoriteAccountsTable}
            pagination={false}
            onRow={(record) => {
              return { onClick: () => { window.open(`/${record.key}`, '_blank') } }
            }}
          />}
      </>
    }

  </div>
}

export default FavoriteAccountsLayout