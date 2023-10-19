import React from 'react'
import notification from 'antd/lib/notification'
import { message } from 'antd'
import { isMobileDevice } from './Size.config'
import { IconType, NotificationPlacement, ArgsProps } from 'antd/es/notification/interface'

export type Message = React.ReactNode

export type MessageProps = {
  message: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  placement?: NotificationPlacement
  duration?: number | null
  key?: string
}

const DefaultPlacement: NotificationPlacement = 'bottomLeft'

const DefaultDuration = 3

message.config({
  top: typeof window !== 'undefined' ? window.innerHeight - 120 : 24,
  duration: DefaultDuration,
  maxCount: 1
}) // Setup global config for messages

const showMessage = (
  notifFn: (args: ArgsProps) => void,
  props: Message | MessageProps
) => {
  if (typeof props === 'object' && (props as MessageProps).message) {
    const { placement = DefaultPlacement, ...msgProps } = props as MessageProps
    notifFn({ ...msgProps, placement })
  } else {
    notifFn({ message: props as Message, placement: DefaultPlacement })
  }
}

export const resolveNotififcation = (type: IconType, props: ArgsProps) => {
  const { message: content, ...messageProps } = props

  return isMobileDevice
    ? message.info({ content, type, style: { fontSize: '1rem' }, ...messageProps })
    : notification.open({ type, ...props })
}

export const closeNotification = (key: string) => isMobileDevice ? message.destroy() : notification.destroy(key)

export const createNotifFn = (type: IconType) => (props: ArgsProps) => resolveNotififcation(type, props)

export const showInfoMessage = (props: Message | MessageProps) => {
  showMessage(createNotifFn('info'), props)
}

export const showSuccessMessage = (props: Message | MessageProps) => {
  showMessage(createNotifFn('success'), props)
}

export const showErrorMessage = (props: Message | MessageProps) => {
  showMessage(createNotifFn('error'), props)
}

export const showWarnMessage = (props: Message | MessageProps) => {
  showMessage(createNotifFn('warning'), props)
}

type ControlledMessageProps = MessageProps & {
  type: IconType
}

export const controlledMessage = ({
  key = `open${new Date().getMilliseconds()}`,
  type,
  placement = DefaultPlacement,
  ...otherProps
}: ControlledMessageProps) => {
  return {
    open: () => {
      resolveNotififcation(type, {
        key,
        placement,
        ...otherProps
      })
    },
    close: () => {
      closeNotification(key)
    }
  }
}
