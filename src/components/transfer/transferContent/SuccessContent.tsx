import { toShortMoney } from '@subsocial/utils'
import { MutedSpan } from '../../utils/MutedText'
import { DfCardSideBySideContent, DfCardSideBySideContentProps } from '../../utils/DfCard'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { ExtendedTransferFormData } from './TransferForm'
import { useIsMyConnectedAddress } from '../../providers/MyExtensionAccountsContext'
import { useTokenAmountInUsd } from '@/rtk/features/prices/pricesHooks'
import { useRef } from 'react'
import clsx from 'clsx'
import { toShortAddress } from '../../utils'

function SuccessContent ({
  data,
  closeModal,
}: {
  data: ExtendedTransferFormData | undefined
  closeModal?: (e: any) => void
}) {
  const { t } = useTranslation()
  const isSendingToSelf = useIsMyConnectedAddress(data?.recipient ?? '')
  const tokenAmountInUsd = useTokenAmountInUsd(
    data?.token ?? '',
    parseFloat(data?.amount || '0')
  )
  const cacheInvalidationTime = useRef(Date.now())

  const cardClassName = clsx('DfBgColor')

  if (!data) return null
  const { amount, recipient, sourceChainName, token, destChainName } = data

  const firstCardContent: DfCardSideBySideContentProps['content'] = [
    {
      label: t('transfer.recipient'),
      value: isSendingToSelf
        ? t('transfer.yourAccount')
        : toShortAddress(recipient) ?? '',
    },
  ]
  
  if (!destChainName) {
    firstCardContent.push({
      label: t('transfer.source'),
      value: sourceChainName ?? '',
    })
  }
  const secondCardContent: DfCardSideBySideContentProps['content'] = [
    { label: t('transfer.source'), value: sourceChainName ?? '' },
    { label: t('transfer.dest'), value: destChainName ?? '' },
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
          pointerEvents: 'none',
        }}
      />
      <div className='d-flex flex-column align-items-stretch GapNormal position-relative'>
        <div className='d-flex flex-column align-items-center bs-mb-2'>
          <span className='FontBig font-weight-semibold'>
            {amount} {token}
          </span>
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
        <Button
          onClick={closeModal}
          type='primary'
          block
          size='large'
          className='bs-mt-2'
        >
          {t('buttons.gotIt')}
        </Button>
      </div>
    </div>
  )
}

export default SuccessContent