import React, { useState, useRef, useMemo, useEffect } from 'react'
import styles from './ChatFloatingModal.module.sass'
import { useSortMyBalances } from 'src/utils/hooks/useSortMyBalances'
import { Button } from 'antd'
import { TOKEN_TO_CHAT_ID } from './chat-ids'
import clsx from 'clsx'
import { grillchatUrl } from 'src/config/env'

export default function ChatFloatingModal () {
  const [ isOpen, setIsOpen ] = useState(false)
  const toggleChat = () => {
    setIsOpen((prev) => !prev)
  }
  const hasOpened = useRef(false)
  useEffect(() => {
    if (isOpen) hasOpened.current = true
  }, [ isOpen ])

  const balances = useSortMyBalances()
  const order = useMemo<string[]>(() => {
    if (balances.length === 0) return []
    const appendedToken = new Set()
    return balances
      .map(({ token }) => {
        if (appendedToken.has(token)) return ''
        const tokenId =
          TOKEN_TO_CHAT_ID?.[
            token.toLowerCase() as keyof typeof TOKEN_TO_CHAT_ID
          ]
        if (tokenId) appendedToken.add(token)
        return tokenId
      })
      .filter((id) => !!id)
  }, [ balances ])

  const urlParam = new URLSearchParams()
  order.forEach((id) => {
    urlParam.append('order', id)
  })

  if (!grillchatUrl) {
    return null
  }

  const iframeLink = `${grillchatUrl}?theme=light&${urlParam.toString()}`

  return (
    <div className={styles.ChatFloatingModal}>
      {(isOpen || hasOpened.current) && (
        <div
          className={clsx(
            styles.ChatFloatingIframe,
            !isOpen && styles.ChatFloatingIframeHidden
          )}
        >
          <iframe
            sandbox='allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation'
            src={iframeLink}
          />
        </div>
      )}
      <Button className={styles.ChatFloatingButton} onClick={toggleChat}>
        <img src='/images/grillchat.svg' alt='GrillChat' />
      </Button>
    </div>
  )
}
