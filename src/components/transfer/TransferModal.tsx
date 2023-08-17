import { Button, Tabs } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import CustomModal, { CustomModalProps } from '../utils/CustomModal'
import TransferForm, { TransferFormDefaultToken, ExtendedTransferFormData, DEFAULT_TOKEN } from './TransferForm'
import LoadingTransaction from '../utils/LoadingTransaction'
import { toShortAddress } from '../utils'
import { MutedSpan } from '../utils/MutedText'
import { DfCardSideBySideContent, DfCardSideBySideContentProps } from '../utils/DfCard'
import { useTokenAmountInUsd } from 'src/rtk/features/prices/pricesHooks'
import { toShortMoney } from '@subsocial/utils'
import { useIsMyConnectedAddress } from '../providers/MyExtensionAccountsContext'
import { useTranslation } from 'react-i18next'
import { isTokenBridgeable } from './configs/cross-chain'
import styles from './TokenSelector.module.sass'

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
      to <strong>{isSendingToSelf ? t('transfer.yourAccount') : toShortAddress(transferData?.recipient ?? '')}</strong>{' '}
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

  const disableCrossChainTab = !isTokenBridgeable(defaultSelectedToken?.token ?? '')
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
      crossChain={activeTab === getTabKey('cross-chain')}>
      {(formSection, buttonSection) => (
        <CustomModal
          fullHeight={currentState !== 'success'}
          centered={currentState === 'success'}
          noScroll={currentState === 'success'}
          title={t('transfer.title')}
          subtitle={subtitle}
          className={clsx(className, { [styles.CustomSuccessModalContainer]: currentState === 'success' }) }
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
              !isFormVisible
                ? 'd-none'
                : 'flex-fill d-flex flex-column'
            )}>
            <Tabs
              className='bs-mb-0'
              centered
              activeKey={activeTab}
              onChange={(tab) => setActiveTab(tab as Tabs)}>
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
              {activeTab === 'same-chain' ? t('transfer.subtitle.sameChain') : t('transfer.subtitle.crossChain')}
            </MutedSpan>
            {formSection}
          </div>
        </CustomModal>
      )}
    </TransferForm>
  )
}

function SuccessContent ({ data, closeModal }: { data: ExtendedTransferFormData | undefined; closeModal?: (e: any) => void }) {
  const { t } = useTranslation()
  const isSendingToSelf = useIsMyConnectedAddress(data?.recipient ?? '')
  const tokenAmountInUsd = useTokenAmountInUsd(data?.token ?? '', parseFloat(data?.amount || '0'))
  const cacheInvalidationTime = useRef(Date.now())

  const cardClassName = clsx('DfBgColor')

  if (!data) return null
  const { amount, recipient, sourceChainName, token, destChainName } = data

  const firstCardContent: DfCardSideBySideContentProps['content'] = [
    { label: t('transfer.recipient'), value: isSendingToSelf ? t('transfer.yourAccount') : (toShortAddress(recipient) ?? '') }
  ]
  if (!destChainName) {
    firstCardContent.push({ label: t('transfer.source'), value: sourceChainName ?? '' })
  }
  const secondCardContent: DfCardSideBySideContentProps['content'] = [
    { label: t('transfer.source'), value: sourceChainName ?? '' },
    { label: t('transfer.dest'), value: destChainName ?? '' }
  ]

  return (
    <div className='position-relative'>
      <div
        className='position-absolute inset-0 w-100 h-100'
        style={{
          zIndex: 1,
          transform: 'translateY(-70%)',
          // date is added to make the gif animation runs every time
          backgroundImage: `url(/images/confetti.gif?d=${cacheInvalidationTime.current})`,
          backgroundSize: 'cover',
          pointerEvents: 'none'
        }}
      />
      <div className='d-flex flex-column align-items-stretch GapNormal position-relative'>
        <div className='d-flex flex-column align-items-center bs-mb-2'>
          <span className='FontBig font-weight-semibold'>{amount} {token}</span>
          {tokenAmountInUsd ? (
            <MutedSpan>${toShortMoney({ num: tokenAmountInUsd })}</MutedSpan>
          ) : null}
        </div>
        <DfCardSideBySideContent
          noShadow
          className={cardClassName}
          content={firstCardContent}
        />
        {destChainName && (
          <DfCardSideBySideContent
            noShadow
            className={cardClassName}
            content={secondCardContent}
          />
        )}
        <Button onClick={closeModal} type='primary' block size='large' className='bs-mt-2'>{t('buttons.gotIt')}</Button>
      </div>
    </div>
  )
}
