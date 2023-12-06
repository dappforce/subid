import { Button, Tabs } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import CustomModal, { CustomModalProps } from '../utils/CustomModal'
import TransferForm, {
  TransferFormDefaultToken,
  ExtendedTransferFormData,
  DEFAULT_TOKEN,
} from './TransferForm'
import LoadingTransaction from '../utils/LoadingTransaction'
import { toShortAddress } from '../utils'
import { MutedSpan } from '../utils/MutedText'
import {
  DfCardSideBySideContent,
  DfCardSideBySideContentProps,
} from '../utils/DfCard'
import { useTokenAmountInUsd } from 'src/rtk/features/prices/pricesHooks'
import { toShortMoney } from '@subsocial/utils'
import { useIsMyConnectedAddress } from '../providers/MyExtensionAccountsContext'
import { useTranslation } from 'react-i18next'
import styles from './TokenSelector.module.sass'
import { isTokenBridgeable } from './configs/cross-chain'
import SuccessContent from './SuccessContent'

type TransferModalProps = CustomModalProps & {
  defaultSelectedToken?: TransferFormDefaultToken
  defaultRecipient?: string
}

type Tabs = 'same-chain' | 'cross-chain'
const getTabKey = (tab: Tabs) => tab

export default function TransferModal ({
  defaultSelectedToken = DEFAULT_TOKEN,
  className,
  defaultRecipient,
  ...props
}: TransferModalProps) {
  const { t } = useTranslation()

  const [ currentState, setCurrentState ] = useState<
    'form' | 'loading' | 'success'
  >('form')
  const [ transferData, setTransferData ] = useState<
    ExtendedTransferFormData | undefined
  >()
  const [ activeTab, setActiveTab ] = useState(getTabKey('same-chain'))
  const isSendingToSelf = useIsMyConnectedAddress(transferData?.recipient ?? '')

  useEffect(() => {
    if (!props.visible) return
    setActiveTab('same-chain')
    setCurrentState('form')
    setTransferData(undefined)
  }, [ props.visible ])

  const txSummary = (
    <span className='d-block'>
      Transferring{' '}
      <strong>
        {transferData?.amount} {transferData?.token}
      </strong>{' '}
      to{' '}
      <strong>
        {isSendingToSelf
          ? t('transfer.yourAccount')
          : toShortAddress(transferData?.recipient ?? '')}
      </strong>{' '}
      {transferData?.destChainName ? (
        <span>
          from <strong>{transferData.sourceChainName}</strong> to{' '}
          <strong>{transferData.destChainName}</strong>
        </span>
      ) : (
        <span>
          on the <strong>{transferData?.sourceChainName}</strong> network
        </span>
      )}
    </span>
  )

  let subtitle: string | JSX.Element | undefined = undefined
  if (currentState === 'loading') {
    subtitle = txSummary
  } else if (currentState === 'success') {
    if (transferData?.destChainName) {
      subtitle = ` ${t('transfer.successSubtitle.crossChain')}`
    } else {
      subtitle = t('transfer.successSubtitle.sameChain')
    }
  }

  const disableCrossChainTab = !isTokenBridgeable(
    defaultSelectedToken?.token ?? ''
  )
  const isFormVisible = currentState === 'form'

  return (
    <TransferForm
      onTransferClick={(param) => {
        setCurrentState('loading')
        setTransferData(param)
      }}
      defaultRecipient={defaultRecipient}
      onTransferFailed={() => setCurrentState('form')}
      onTransferSuccess={() => setCurrentState('success')}
      className='flex-fill'
      defaultSelectedToken={defaultSelectedToken}
      crossChain={activeTab === getTabKey('cross-chain')}
    >
      {(formSection, buttonSection) => (
        <CustomModal
          fullHeight={currentState !== 'success'}
          centered={currentState === 'success'}
          noScroll={currentState === 'success'}
          title={t('transfer.title')}
          subtitle={subtitle}
          className={clsx(className, {
            [styles.CustomSuccessModalContainer]: currentState === 'success',
          })}
          footer={isFormVisible ? buttonSection : undefined}
          {...props}
        >
          {currentState === 'loading' && (
            <div className='flex-fill d-flex flex-column justify-content-center'>
              <LoadingTransaction className='mt-3 mb-5' />
            </div>
          )}
          {currentState === 'success' && (
            <SuccessContent closeModal={props.onCancel} data={transferData} />
          )}
          <div
            className={clsx(
              !isFormVisible ? 'd-none' : 'flex-fill d-flex flex-column'
            )}
          >
            <Tabs
              className='bs-mb-0'
              centered
              activeKey={activeTab}
              onChange={(tab) => setActiveTab(tab as Tabs)}
            >
              <Tabs.TabPane
                key={getTabKey('same-chain')}
                tab={
                  <span className='FontMedium'>{t('transfer.sameChain')}</span>
                }
              />
              <Tabs.TabPane
                key={getTabKey('cross-chain')}
                tab={
                  <span className='FontMedium'>{t('transfer.crossChain')}</span>
                }
                disabled={disableCrossChainTab}
              />
            </Tabs>
            <MutedSpan className='bs-mb-3'>
              {activeTab === 'same-chain'
                ? t('transfer.subtitle.sameChain')
                : t('transfer.subtitle.crossChain')}
            </MutedSpan>
            {formSection}
          </div>
        </CustomModal>
      )}
    </TransferForm>
  )
}
