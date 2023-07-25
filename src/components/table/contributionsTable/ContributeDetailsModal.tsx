import { ButtonProps, Button } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { startWithUpperCase } from '../../utils'
import styles from '../Table.module.sass'

type DetailsModalProps = {
  trigger: React.FC<ButtonProps>
  title: string
  details: React.ReactNode
}

export const DetailsModal = ({ trigger, title, details }: DetailsModalProps) => {
  const [ visible, setVisible ] = useState(false)
  const { t } = useTranslation()

  const open = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setVisible(true)
  }

  const close = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setVisible(false)
  }

  const OpenButton = trigger

  const footer = (
    <Button type='primary' ghost size='large' onClick={close}>
     {t('buttons.gotIt')}
    </Button>
  )

  return (
    <>
      <OpenButton onClick={open} />
      <Modal visible={visible} onCancel={close} title={title} footer={footer}>
        {details}
      </Modal>
    </>
  )
}

type ContributeDetailsModal = {
  network: string
  details: React.ReactNode
  sendEvent: VoidFunction
}

export const ContributeDetailsModal = ({ network, details, sendEvent }: ContributeDetailsModal) => {
  const { t } = useTranslation()
  
  const DetailsButton = ({ onClick: clk, ...props }: ButtonProps) => {
    const click = (e: React.MouseEvent<any>) => {
      clk && clk(e)
      sendEvent()
    }

    return <Button {...props as any} onClick={click} className={styles.ActiveCrowdloan} shape='round'>{t('buttons.contribute')}</Button>
  }

  return <DetailsModal
    details={details}
    trigger={DetailsButton}
    title={t('modals.howToContribute') + `${startWithUpperCase(network)}?`}
  />
}
