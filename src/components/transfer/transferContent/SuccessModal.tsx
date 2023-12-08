import clsx from 'clsx'
import { ExtendedTransferFormData } from '../TransferForm'
import SuccessContent from './SuccessContent'
import CustomModal from '@/components/utils/CustomModal'
import { useTranslation } from 'react-i18next'
import styles from '../TokenSelector.module.sass'

type TransferSuccessModalProps = {
  visible: boolean
  close: () => void
  transferData?: ExtendedTransferFormData
}

const TransferSuccessModal = ({
  visible,
  close,
  transferData,
}: TransferSuccessModalProps) => {
  const { t } = useTranslation()

  let subtitle: string | JSX.Element | undefined = undefined

  if (transferData?.destChainName) {
    subtitle = ` ${t('transfer.successSubtitle.crossChain')}`
  } else {
    subtitle = t('transfer.successSubtitle.sameChain')
  }

  return (
    <CustomModal
      visible={visible}
      fullHeight={false}
      centered={true}
      closable
      noScroll={true}
      title={t('transfer.title')}
      subtitle={subtitle}
      className={clsx(styles.CustomSuccessModalContainer)}
    >
      <SuccessContent closeModal={close} data={transferData} />
    </CustomModal>
  )
}

export default TransferSuccessModal
