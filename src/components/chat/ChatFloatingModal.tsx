import React, { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { BsFillChatLeftTextFill } from 'react-icons/bs'
import styles from './ChatFloatingModal.module.sass'
import { chatActions } from 'src/rtk/features/chat/chatSlice'
import { useSortMyBalances } from 'src/utils/hooks/useSortMyBalances'
import { Button } from 'antd'
import { TOKEN_TO_CHAT_ID } from './chat-ids'

export default function ChatFloatingModal () {
  const { isOpen } = useAppSelector((state) => state.chat)
  const dispatch = useAppDispatch()
  const toggleChat = () => dispatch(chatActions.toggleChat())

  const balances = useSortMyBalances()
  const order = useMemo<string[]>(() => {
    if (balances.length === 0) return []
    const appendedToken = new Set()
    return balances
      .map(({ token }) => {
        if (appendedToken.has(token)) return ''
        const tokenId = TOKEN_TO_CHAT_ID?.[token.toLowerCase() as keyof typeof TOKEN_TO_CHAT_ID]
        if (tokenId) appendedToken.add(token)
        return tokenId
      })
      .filter((id) => !!id)
  }, [ balances ])

  const urlParam = new URLSearchParams()
  order.forEach((id) => {
    urlParam.append('order', id)
  })

  if (balances.length === 0) return null

  return (
    <div className={styles.ChatFloatingModal}>
      {isOpen && (
        <div className={styles.ChatFloatingIframe}>
          <iframe src={`https://iframe-configs-grillchat.subsocial.network/1004?${urlParam.toString()}`} />
        </div>
      )}
      <Button className={styles.ChatFloatingButton} onClick={toggleChat}>
        <BsFillChatLeftTextFill />
      </Button>
    </div>
  )
}