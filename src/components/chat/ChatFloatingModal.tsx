import React, { useState, useRef } from 'react'
import styles from './ChatFloatingModal.module.sass'
import { Button } from 'antd'
import { useSendGaUserEvent } from '../../ga'
import { HiChevronDown } from 'react-icons/hi2'
import ChatIframe from './ChatIframe'
import clsx from 'clsx'
import { createPortal } from 'react-dom'
import { useResponsiveSize } from '../responsive'
import { useSendEvent } from '../providers/AnalyticContext'

export default function ChatFloatingModal () {
  const { isLargeDesktop } = useResponsiveSize()
  const sendAmpEvent = useSendEvent()

  const [ unreadCount, setUnreadCount ] = useState(0)
  const [ isOpen, setIsOpen ] = useState(false)
  const sendEvent = useSendGaUserEvent()

  const hasOpened = useRef(false)
  const toggleChat = () => {
    let event
    if (isOpen) event = 'close_grill_iframe'
    else event = 'open_grill_iframe'
    sendEvent(event)
    sendAmpEvent(event)

    setIsOpen((prev) => !prev)
    hasOpened.current = true
  }

  if (isLargeDesktop) {
    return null
  }

  return (
    <>
      {createPortal(
        <div className={clsx(styles.ChatContainer, !isOpen && styles.ChatContainerHidden)}>
          <div className={clsx(styles.ChatOverlay)} onClick={() => setIsOpen(false)} />
          <div className={clsx(styles.ChatContent)}>
            <div className={clsx(styles.ChatControl)}>
              <Button onClick={toggleChat}><HiChevronDown /></Button>
            </div>
            <ChatIframe setUnreadCount={setUnreadCount} className={styles.ChatIframe} />
          </div>
        </div>,
        document.body
      )}
      {createPortal(
        <Button className={styles.ChatFloatingButton} onClick={toggleChat}>
          <img src='/images/grillchat.svg' alt='GrillChat' />
          <span>Polkadot Chat</span>
          {!!unreadCount && <span className={styles.ChatUnreadCount}>{unreadCount}</span>}
        </Button>,
        document.body
      )}
    </>
  )
}
