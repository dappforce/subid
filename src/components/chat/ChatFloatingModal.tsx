import React, { useState, useRef } from 'react'
import styles from './ChatFloatingModal.module.sass'
import { Button } from 'antd'
import { useSendGaUserEvent } from '../../ga'
import { HiChevronDown } from 'react-icons/hi2'
import ChatIframe from './ChatIframe'
import clsx from 'clsx'
import { createPortal } from 'react-dom'
import { useResponsiveSize } from '../responsive'

export default function ChatFloatingModal () {
  const { isLargeDesktop } = useResponsiveSize()

  const [ isOpen, setIsOpen ] = useState(false)
  const sendEvent = useSendGaUserEvent()

  const hasOpened = useRef(false)
  const toggleChat = () => {
    sendEvent('open_grill_iframe')
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
            {(isOpen || hasOpened.current) && <ChatIframe className={styles.ChatIframe} />}
          </div>
        </div>,
        document.body
      )}
      {/* {(isOpen || hasOpened.current) && (
      )} */}
      {createPortal(
        <Button className={styles.ChatFloatingButton} onClick={toggleChat}>
          <img src='/images/grillchat.svg' alt='GrillChat' />
          <span>Polkadot Chat</span>
        </Button>,
        document.body
      )}
    </>
  )
}
