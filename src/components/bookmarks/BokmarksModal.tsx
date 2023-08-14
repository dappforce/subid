import { useState } from 'react'
import { Button, Modal, Form, Input } from 'antd'
import styles from './Bookmarks.module.sass'
import { useCurrentAccount } from '../providers/MyExtensionAccountsContext'
import BaseAvatar from '../utils/DfAvatar'
import { MutedDiv } from '../utils/MutedText'
import Name from '../homePage/address-views/Name'
import { toShortAddress } from '../utils/index'
import { useIdentitiesByAccounts, getIdentityByAccount, getSubsocialIdentityByAccount } from '../../rtk/features/identities/identitiesHooks'
import { toGenericAccountId, log } from '../../rtk/app/util'
import { setFavoriteAccounts, getFavoriteAccountsFromStorage, removeFromFavorites, showAddOrEditInfoMessage } from './utils'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

type FormFields = {
  desc: string
}

export const fieldName = (name: keyof FormFields) => name

type ModalBodyProps = {
  address: string
  favoriteAccounts?: Record<string, string>
  hide: () => void
  additionalAddFn?: () => void
  isInFavorites: boolean
  notes?: string
}

const ModalBody = ({
  address,
  hide,
  additionalAddFn,
  favoriteAccounts = {},
  isInFavorites,
  notes
}: ModalBodyProps) => {

  const { t } = useTranslation()
  const [ form ] = Form.useForm()
  const [ desc, setDesc ] = useState<string>(notes || '')
  const currentAddress = useCurrentAccount()
  const { asPath } = useRouter()

  const identitiesByAccount = useIdentitiesByAccounts([ address ])
  const favoriteAccountsKeys = Object.keys(favoriteAccounts)

  const identities = getIdentityByAccount(address, identitiesByAccount)
  const owner = getSubsocialIdentityByAccount(address, identitiesByAccount)

  const showModalDesc = favoriteAccountsKeys.length === 0

  const getFieldValues = (): FormFields => {
    return form.getFieldsValue() as FormFields
  }

  const updateDesc = () => {
    const descValue = getFieldValues().desc

    setDesc(descValue)
  }

  const onFinish = () => {
    setFavoriteAccounts(address, desc)

    hide()
    additionalAddFn?.()
    showAddOrEditInfoMessage(t, currentAddress.join(''), isInFavorites, !asPath.includes('/favorites'))
  }

  const onFinishFailed = (errorInfo: any) => {
    log.error('Failed:', errorInfo)
  }

  const onSubmitClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
  }

  return <>
    <Form
      form={form}
      layout='vertical'
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      {showModalDesc && <MutedDiv className={styles.Desc}>{t('favoritesAccounts.modal.desc')}</MutedDiv>}

      <div className={clsx(styles.AccountSection, { ['mt-2']: !showModalDesc })}>
        <div>
          <BaseAvatar address={address} avatar={owner?.image} size={64} />
        </div>
        <div>
          <Name address={address} identities={identities} className={styles.AccountName} />
          <MutedDiv className='d-flex mr-2 align-items-center'>
            <img src='/images/wallet.svg' className={styles.Icon} />{' '}
            <span className={styles.Address}>{toShortAddress(address)}</span>
          </MutedDiv>
        </div>
      </div>
      <Form.Item name={fieldName('desc')} className={styles.DescInput}>
        <Input
          placeholder={t('favoritesAccounts.placeholder')}
          defaultValue={desc}
          onChange={updateDesc}
          className={styles.NotesInput}
          autoComplete='off'
          allowClear
        />
      </Form.Item>
      <div className={clsx(styles.ActionButtons)}>
        <Form.Item>
          <Button onClick={hide}>{t('favoritesAccounts.buttons.cancel')}</Button>
        </Form.Item>

        <Form.Item className='bs-ml-3'>
          <Button
            type='primary'
            htmlType='submit'
            onClick={onSubmitClick}
          >
            {isInFavorites ? t('favoritesAccounts.buttons.save') : t('favoritesAccounts.buttons.add')}
          </Button>
        </Form.Item>
      </div>
    </Form>
  </>
}

type BookmarksModalProps = {
  address?: string
  buttonType?: 'primary' | 'link' | 'text' | 'ghost' | 'default' | 'dashed' | undefined
  actionButtonIcon: React.ReactNode
  additionalAddFn?: () => void
  buttonClassName?: string
  removeOnDobleClick?: boolean
  setRefresh?: (refresh: boolean) => void
  notes?: string
}

export const BookmarksModal = ({
  actionButtonIcon,
  address,
  buttonType = undefined,
  additionalAddFn,
  buttonClassName,
  removeOnDobleClick = false,
  setRefresh,
  notes
}: BookmarksModalProps) => {
  const [ opened, setOpened ] = useState(false)
  const [ showModal, setShowModal ] = useState(false)
  const currentAccounts = useCurrentAccount()
  const { t } = useTranslation()

  const currentAccount = address ? address : currentAccounts.join(',')

  const favoriteAccountsFromStorage = getFavoriteAccountsFromStorage()

  const isInFavorites = !!Object.keys(favoriteAccountsFromStorage).find(x => x === toGenericAccountId(currentAccount))

  const open = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()

    setOpened(true)
    setShowModal(true)
  }

  const onDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()

    removeFromFavorites({ favoriteAccountsFromStorage, setRefresh, account: currentAccount, t })
  }

  const hide = () => {
    setShowModal(false)
  }

  return (<>
    {opened && <>
      <div onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}>
        <Modal
          visible={showModal}
          title={<h3 className='font-weight-bold m-0'>
            {isInFavorites ? t('favoritesAccounts.modal.editTitle') : t('favoritesAccounts.modal.addTitle')}
          </h3>}
          footer={null}
          width={680}
          className={styles.BookmarksModal}
          onCancel={hide}
        >
          <ModalBody
            address={currentAccount}
            hide={hide}
            additionalAddFn={additionalAddFn}
            favoriteAccounts={favoriteAccountsFromStorage}
            isInFavorites={isInFavorites}
            notes={notes}
          />
        </Modal>
      </div>
    </>}
    <Button
      type={buttonType}
      className={clsx(buttonClassName)}

      onClick={isInFavorites && removeOnDobleClick ? onDoubleClick : open}
    >
      {actionButtonIcon}
    </Button>
  </>
  )
}

export default BookmarksModal
