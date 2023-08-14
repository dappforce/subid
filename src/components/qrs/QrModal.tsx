import { ButtonProps, Button, Row, Tooltip } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import { useState } from 'react'
import QrCode from 'react-qr-code'
import { AnyAddress, isValidAddress } from '../utils'
import { MutedDiv } from '../utils/MutedText'
import { HiOutlineQrCode } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { CopyOutlined } from '@ant-design/icons'
import copy from 'copy-to-clipboard'
import { showInfoMessage } from '../utils/Message'
import { useRouter } from 'next/router'
import clsx from 'clsx'

type QrModalProps = {
  trigger: React.FC<ButtonProps>
  address: AnyAddress
  network?: string
  title: string
  openFromUrl?: boolean
  className?: string
}

export const QrModal = ({ trigger, title, address, network, openFromUrl, className }: QrModalProps) => {
  const { asPath } = useRouter()
  const { t } = useTranslation()

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const forceOpen = openFromUrl && asPath.endsWith('qr') // TODO: dirty code

  const [ visible, setVisible ] = useState(forceOpen)
  const [ opened, setOpened ] = useState(forceOpen)

  const currentChainName = network || 'Substrate'

  const shareAddressLink = origin + '/' + address

  const open = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()

    !opened && setOpened(true)
    setVisible(true)
  }

  const close = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()

    setVisible(false)
  }

  const OpenButton = trigger

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()

    copy(shareAddressLink)
    showInfoMessage(t('general.addressCopied'))
  }

  const footer = (
    <Row justify='end'>
      <Button size='large' onClick={onClick}>
        {t('buttons.copy')} <CopyOutlined className='ml-1' />
      </Button>
      <Button type='primary' ghost size='large' onClick={close}>
        {t('buttons.close')}
      </Button>
    </Row>
  )

  return (
    <>
      <OpenButton onClick={open} />
      <Modal className={className} visible={visible} onCancel={close} title={title} footer={footer}>
        <Row justify='center'>
          <QrCode value={shareAddressLink} />
        </Row>
        <Row justify='center' className='mt-3 mb-2'>
          <MutedDiv>{currentChainName} {t('general.address')}:</MutedDiv>
        </Row>
        <Row justify='center' className='bs-px-2' style={{ wordBreak: 'break-word' }}>
          {address}
        </Row>
      </Modal>
    </>
  )
}

export const AddressQrModal = ({ className, modalClassName, ...props }: Omit<QrModalProps, 'trigger' | 'title'> & { modalClassName?: string }) => {
  const address = props.address.toString()
  const { t } = useTranslation()

  if (!isValidAddress(address)) return null

  const QrButton = (props: ButtonProps) => (
    <Tooltip title={t('tooltip.showQR')}>
      <HiOutlineQrCode className={clsx('DfGreyLink', className)} style={{ transform: 'scale(1.15)' }} {...(props as any)} />
    </Tooltip>
  )

  return <QrModal {...props} className={modalClassName} trigger={QrButton} title={t('modals.accountAddress')} />
}
