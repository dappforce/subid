import React from 'react'
import Modal from 'antd/lib/modal'
import { InjectedAccount } from '@polkadot/extension-inject/types'
import { DropdownItems } from '../topMenu/TopMenu'
import { useIsSignedIn, useMyExtensionAddresses, useMyExtensionAccount, StepsEnum } from '../providers/MyExtensionAccountsContext'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import WalletList from '../wallets/wallet-list/WalletsList'
import styles from './SignInModal.module.sass'
import { ExternalLink } from '../identity/utils'
import config from 'src/config'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import clsx from 'clsx'
import { MutedDiv } from '../utils/MutedText'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { SupportedWalletsType } from '../wallets/supportedWallets'

const { mobileAppLogo } = config

type ModalProps = {
  open: boolean
  hide: () => void
  walletsType?: SupportedWalletsType
}

type ModalContent = {
  title: React.ReactNode
  body: React.ReactNode
  footer: React.ReactNode
  warn?: string
}

const ModalFooter = () => (
  <div className={styles.ModalFooter}>
    <ExternalLink
      className='bs-mr-2'
      url='https://subsocial.network/legal/terms'
      value='Terms of Use'
    />
    ·
    <ExternalLink
      className='ml-2'
      url='https://subsocial.network/legal/privacy'
      value='Privacy Policy'
    />
  </div>
)

type ModalTitleProp = {
  setCurrentStep: (step: number) => void
  currentStep: number
}

const ModalTitle = ({ setCurrentStep, currentStep }: ModalTitleProp) => {
  const { isMobile } = useResponsiveSize()
  const isShowBackButton = currentStep !== StepsEnum.SelectWallet
  const { t } = useTranslation()
  return <>
    <div className='position-absolute'>
      {(isShowBackButton && !isMobile) &&
        <Button type='link' className={styles.Back} onClick={() => setCurrentStep(currentStep - 1)} >
          <ArrowLeftOutlined />
          <span>{t('signIn.back')}</span>
        </Button>}
    </div>
    <div className='d-flex align-items-center justify-content-center pr-2 pl-2'>
      <img className={clsx(styles.ModalLogo)} src={mobileAppLogo} alt='SubId' />
      <div></div>
    </div>
  </>
}

type ModalBodyWrapperProps = {
  children: React.ReactNode
}

const ModalBodyWrapper = ({ children }: ModalBodyWrapperProps) => (
  <div className={styles.BodyTitle}>
    {children}
  </div>
)

type GetModalContentProps = {
  isSignIn: boolean
  hide: () => void
  t: TFunction
  accounts?: InjectedAccount[]
  setCurrentStep: (step: number) => void
  currentStep: number
  walletsType?: SupportedWalletsType
}

const getModalContent = ({ isSignIn, hide, t, accounts, setCurrentStep, currentStep, walletsType = 'all' }: GetModalContentProps) => {
  const content: ModalContent = {
    title: <ModalTitle setCurrentStep={setCurrentStep} currentStep={currentStep} />,
    body: null,
    footer: <ModalFooter />
  }

  switch (currentStep) {
    case StepsEnum.SelectWallet: {
      content.body = (
        <div>
          <ModalBodyWrapper>
            <h2 className='font-weight-bold'>{t('signIn.walletTitle')}</h2>
            <MutedDiv>
              {t('signIn.walletsDesc')}
              {' '}<ExternalLink
                url='https://docs.subsocial.network/docs/faq/getting-started/account-setup/polkadot-js/'
                value={t('signIn.setupWalletLink')}
              />
            </MutedDiv>
          </ModalBodyWrapper>
          <WalletList setCurrentStep={setCurrentStep} walletsType={walletsType} />
        </div>
      )
      break
    }
    case StepsEnum.SelectAccount: {
      content.body = (
        <div>
          <ModalBodyWrapper>
            <h2 className='font-weight-bold'>{t('signIn.accountsTitle')}</h2>
            <MutedDiv>
              {t('signIn.accountsDesc')}
            </MutedDiv>
          </ModalBodyWrapper>
          <DropdownItems accounts={accounts} isSignIn={isSignIn} hideSignInModal={hide} />
        </div>
      )
      break
    }
    default:
      break
  }

  return content
}

type ModalViewProps = ModalProps & {
  accounts?: InjectedAccount[]
}

export const SignInModalView = ({ open, hide, accounts, walletsType = 'all' }: ModalViewProps) => {
  const isSignIn = useIsSignedIn()
  const { currentStep, setCurrentStep } = useMyExtensionAccount()

  const { t } = useTranslation()

  const { body, title, footer } = getModalContent({ 
    isSignIn, 
    hide, 
    t, 
    accounts,
    currentStep, 
    setCurrentStep,
    walletsType
  })

  return title ? (
    <Modal
      visible={open}
      title={title}
      footer={footer}
      width={520}
      className='text-center DfSignInModal'
      onCancel={hide}
      destroyOnClose
    >
      <div className={styles.SignInModalBody}>
        {body}
      </div>
    </Modal>
  ) : null
}

export const SignInModal = (props: ModalProps) => {
  const extensionAddress = useMyExtensionAddresses()

  return <SignInModalView accounts={extensionAddress} {...props} />
}

export default SignInModal
