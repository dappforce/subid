import React, { useState, useRef } from 'react'
import styles from './ChatFloatingModal.module.sass'
import { Button } from 'antd'
import { useSendGaUserEvent } from '../../ga'
import ChatIframe from './ChatIframe'
import clsx from 'clsx'

export default function ChatFloatingModal () {
  const [ isOpen, setIsOpen ] = useState(false)
  const sendEvent = useSendGaUserEvent()

  const toggleChat = () => {
    sendEvent('open_grill_iframe')
    setIsOpen((prev) => !prev)
  }
  const hasOpened = useRef(false)

  return (
    <div className={styles.ChatFloatingModal}>
      {(isOpen || hasOpened.current) && (
        <ChatIframe
          className={clsx(
            styles.ChatFloatingIframe,
            !isOpen && styles.ChatFloatingIframeHidden
          )}
        />
      )}
      <Button className={styles.ChatFloatingButton} onClick={toggleChat}>
        <img src='/images/grillchat.svg' alt='GrillChat' />
      </Button>
    </div>
  )
}
