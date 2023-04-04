import React from 'react'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { BsFillChatLeftTextFill } from 'react-icons/bs'
import styles from './ChatFloatingModal.module.sass'
import { chatActions } from 'src/rtk/features/chat/chatSlice'
import { Button } from 'antd'

export default function ChatFloatingModal () {
  const { isOpen, chatId } = useAppSelector((state) => state.chat)
  const dispatch = useAppDispatch()
  const openChat = () => dispatch(chatActions.openChat())

  if (!chatId) return null
  return (
    <div className={styles.ChatFloatingModal}>
      {isOpen && (
        <div className={styles.ChatFloatingIframe}>
          <iframe src={`https://x.grill.app/c/${chatId}`} />
        </div>
      )}
      <Button className={styles.ChatFloatingButton} onClick={openChat}>
        <BsFillChatLeftTextFill />
      </Button>
    </div>
  )
}