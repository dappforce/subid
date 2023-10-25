import { AvatarOrSkeleton } from '../../table/utils'
import { supportedWallets, SupportedWalletsType } from '../supportedWallets/index'
import { DAPP_NAME, setAccountsAndFetchData } from '../../providers/utils'
import { useAppDispatch } from '../../../rtk/app/store'
import { useEffect, useState } from 'react'
import { StepsEnum } from '../../providers/MyExtensionAccountsContext'
import styles from './WalletList.module.sass'
import { DownloadOutlined } from '@ant-design/icons'
import { ButtonLink, getInstallUrl, setCurrentWallet } from '../../utils/index'
import { showWarnMessage } from '../../utils/Message'
import { Wallet } from '../types'
import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

export const CURRENT_WALLET = 'CurrentWalletName'

type GetWalletPorps = {
  setCurrentStep: (step: number) => void
  walletsType?: SupportedWalletsType
}

const WalletList = ({ setCurrentStep, walletsType = 'all' }: GetWalletPorps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [ unsubscribe, setUnsubscribe ] = useState<() => unknown>()

  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe?.()
      }
    }
  })

  const onClick = async (wallet: Wallet) => {
    if (wallet.installed) {
      await wallet.enable(DAPP_NAME)

      if (wallet.enabled) {
        const unsub: any = await wallet.subscribeAccounts(async (accounts) => {
          if (accounts) {
            setAccountsAndFetchData(dispatch, accounts)

            setCurrentStep(StepsEnum.SelectAccount)
            setCurrentWallet(wallet.extensionName)
          }
        })

        setUnsubscribe(unsub)
      }
    } else {
      showWarnMessage(t('signIn.notInstalled', { title: wallet.title }))
    }
  }

  const wallets = supportedWallets[walletsType].map((wallet) => {
    const { title, logo, installed, installUrls } = wallet

    const onInstallButtonClick = (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
    }

    return <div key={title} className={styles.WalletListItem} onClick={() => onClick(wallet)}>
      <div className='d-flex align-items-center'>
        <AvatarOrSkeleton externalIcon icon={logo.src} size={'large'} className='bs-mr-2 align-items-start' />
        <div className='font-weight-bold'>{title}</div>
      </div>
      {!installed &&
        <Tooltip title={t('signIn.installToolTip', { title })}>
          <ButtonLink
            href={getInstallUrl(installUrls)}
            target='_blank'
            className={styles.InstallButton}
            onClick={onInstallButtonClick}
          >
            <DownloadOutlined />
          </ButtonLink>
        </Tooltip>
      }
    </div>
  })

  return <>{wallets}</>
}

export default WalletList