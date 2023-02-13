import React, { useEffect, useState } from 'react'
import Modal from 'antd/lib/modal'
import { InjectedAccount } from '@polkadot/extension-inject/types'
import { MutedDiv } from '../../../utils/MutedText'
import { ExternalLink } from '../../../identity/utils'
import NftsPreview from '../NftsPreview'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import { useLazyConnectionsContext } from 'src/components/lazy-connection/LazyConnectionContext'
import { Alert, Space } from 'antd'
import { ButtonLink } from 'src/components/utils'
import styles from './BannerSection.module.sass'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

const faucetUrl = 'https://polkaverse.com/energy'
const subsocialCollectionOnSingularUrl =
  'https://singular.rmrk.app/space/DQd4dJJs3hiEMAguTQQ9YGCH8Z6Pq8kxpTRMGHMGbWPcMRi?page=1&tab=created&creator=true&showCollections=yes'

type ModalProps = {
  open: boolean
  hide: () => void
}

type ModalViewProps = ModalProps & {
  accounts?: InjectedAccount[]
}

export const InnerSelectBannerModal = ({ open, hide }: ModalViewProps) => {
  const address = useMyAddress()
  const { t } = useTranslation()

  const { getApiByNetwork } = useLazyConnectionsContext()
  const [ hasNRG, setHasNRG ] = useState<boolean>(true)

  useEffect(() => {
    if (!address || !open) return

    let unsubBalance: (() => void) | undefined

    const subBalance = async () => {
      const api = await getApiByNetwork('subsocial')

      unsubBalance = await api?.derive.balances.all(address, ({ freeBalance }) => {
        const isEmptyBalanse = freeBalance.eqn(0)

        setHasNRG(!isEmptyBalanse)
      })
    }

    subBalance()

    return () => {
      unsubBalance && unsubBalance()
    }
  }, [ address, open ])

  const title = <div>
    <h2 className='font-weight-bold'>{t('banner.modal.title')}</h2>
    <MutedDiv className='FontNormal'>
      {t('banner.modal.desc')} <ExternalLink
        url={subsocialCollectionOnSingularUrl}
        value={t('banner.modal.descLinkText')}
      />
    </MutedDiv>
    {!hasNRG && <Alert
      message={t('banner.modal.warning')}
      type='warning'
      showIcon
      className={styles.NoTokensWarning}
      action={
        <Space>
          <ButtonLink href={faucetUrl} type='primary' target='_blank' rel='noreferrer'>{t('banner.modal.warningButton')}</ButtonLink >
        </Space>
      }
    />}
  </div>

  return (
    <Modal
      visible={open}
      title={title}
      footer={null}
      destroyOnClose
      width={610}
      className={clsx('DfSelectBannerModal', styles.BannerModal)}
      onCancel={hide}
    >
      <NftsPreview hide={hide} hasTokens={hasNRG} />
    </Modal>
  )
}

export const SelectBannerModal = (props: ModalProps) => (
  <InnerSelectBannerModal {...props} />
)


export default SelectBannerModal
