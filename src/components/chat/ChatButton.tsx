import clsx from 'clsx'
import React, { ComponentProps } from 'react'
import { BsFillChatLeftTextFill } from 'react-icons/bs'
import styles from './ChatButton.module.sass'
import { useAppDispatch } from 'src/rtk/app/store'
import { chatActions } from 'src/rtk/features/chat/chatSlice'

export type ChatButtonProps = ComponentProps<'div'> & {
  children?: React.ReactNode
  chatId: string
}

export default function ChatButton ({ children, onClick, chatId, ...props }: ChatButtonProps) {
  const dispatch = useAppDispatch()
  const handleClick = (e: Parameters<NonNullable<typeof onClick>>[0]) => {
    onClick?.(e)
    dispatch(chatActions.openChat(chatId))
  }
  if (children) {
    return (
      <div {...props} onClick={handleClick}>
        {children}
      </div>
    )
  }
  return (
    <div {...props} onClick={handleClick} className={clsx(styles.GrillChatButton, props.className)}>
      <BsFillChatLeftTextFill />
    </div>
  )
}