import { Tabs } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import TransferForm, {
  TransferFormDefaultToken,
  ExtendedTransferFormData,
  DEFAULT_TOKEN,
} from './TransferForm'
import LoadingTransaction from '../utils/LoadingTransaction'
import { MutedSpan } from '../utils/MutedText'
import { useTranslation } from 'react-i18next'
import styles from './TokenSelector.module.sass'
import { isTokenBridgeable } from './configs/cross-chain'
import { useRouter } from 'next/router'
import SuccessContent from './transferContent/SuccessContent'

type TransferPageLayoutProps = {
  defaultSelectedToken?: TransferFormDefaultToken
  defaultRecipient?: string
  transferType?: string
  to?: string
}

type Tabs = 'same-chain' | 'cross-chain'
const getTabKey = (tab: Tabs) => tab

const TransferPageLayout = ({
  defaultSelectedToken = DEFAULT_TOKEN,
  defaultRecipient,
  transferType,
}: TransferPageLayoutProps) => {
  const { t } = useTranslation()

  const [currentState, setCurrentState] = useState<
    'form' | 'loading' | 'success'
  >('form')
  const [transferData, setTransferData] = useState<
    ExtendedTransferFormData | undefined
  >()
  const [activeTab, setActiveTab] = useState(
    getTabKey((transferType as any) || 'same-chain')
  )
  const router = useRouter()

  useEffect(() => {
    if (activeTab === transferType) return

    const newTransferType = activeTab === 'same-chain' ? 'same' : 'cross'
    const { pathname, query } = router

    router.replace({
      pathname,
      query: { ...query, transferType: newTransferType },
    })
  }, [activeTab])

  useEffect(() => {
    setCurrentState('form')
    setTransferData(undefined)
  }, [])

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
      className='flex-fill h-100'
      defaultSelectedToken={defaultSelectedToken}
      crossChain={activeTab === getTabKey('cross-chain')}
      changeUrl
    >
      {(formSection, buttonSection) => (
        <div className={styles.TransferLayout}>
          <div className={styles.TransferTitle}>Transfer</div>
          {currentState === 'loading' && (
            <div className='d-flex flex-column justify-content-center'>
              <LoadingTransaction className='mt-3 mb-5' />
            </div>
          )}
          {currentState === 'success' && <SuccessContent data={transferData} />}
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
          {buttonSection}
        </div>
      )}
    </TransferForm>
  )
}

export default TransferPageLayout
