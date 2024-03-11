import clsx from 'clsx'
import { ComponentProps, useEffect, useState } from 'react'
import grill, { GrillConfig, GrillEventListener } from '@subsocial/grill-widget'
import { useSendEvent } from '../providers/AnalyticContext'
import useWrapInRef from '../../hooks/useWrapInRef'
import {
  ChanelTypeChannel,
  GenerateGrillConfigParams,
} from './types'
import { useChatContext } from '../providers/ChatContext'
import { isCreatorStakingPage } from '../utils'
import { useRouter } from 'next/router'
import { getCurrentWallet } from '../utils'

function generateGrillConfig ({
  hubId = 'featured',
  spaceId,
}: GenerateGrillConfigParams): GrillConfig {
  const settings = {
    enableInputAutofocus: true,
    enableBackButton: false,
    enableLoginButton: true,
  }

  const isCreatorStaking = isCreatorStakingPage()

  const hub = { id: hubId }

  const channel = {
        type: 'channel',
        id: '54461',
      } as ChanelTypeChannel

  return {
    hub,
    rootFontSize: '1rem',
    channel: isCreatorStaking && !spaceId
     ? undefined
     : {
      ...channel,
      settings: settings,
     },
    theme: 'light',
  }
}

export type ChatIframeProps = ComponentProps<'div'> & {
  onUnreadCountChange?: (count: number) => void
}

export default function ChatIframe ({
  onUnreadCountChange,
  ...props
}: ChatIframeProps) {
  const sendEvent = useSendEvent()
  const sendEventRef = useWrapInRef(sendEvent)
  const { spaceId, metadata } = useChatContext()
  const [ isLoading, setIsLoading ] = useState(false)
  const { pathname } = useRouter()

  useEffect(() => {
    const config = generateGrillConfig({ spaceId, metadata })

    config.onWidgetCreated = (iframe) => {
      const currentWallet = getCurrentWallet()
      if (currentWallet) {
        iframe.src = `${iframe.src}&wallet=${currentWallet}`
      }
      iframe.onerror = () => {
        sendEventRef.current('chat_widget_error')
      }
      iframe.onmouseenter = () => {
        sendEventRef.current('chat_widget_mouse_enter')
      }
      return iframe
    }

    const listener = onUnreadCountChange
      ? (count: number) => {
          onUnreadCountChange(count)
        }
      : undefined
    const eventListener: GrillEventListener = (eventName, value) => {
      if (eventName === 'unread' && parseInt(value)) listener?.(parseInt(value))
      if (eventName === 'isUpdatingConfig') {
        if (value === 'true') {
          setIsLoading(true)
        } else if (value === 'false') {
          setIsLoading(false)
        }
      }
    }
    grill.addMessageListener(eventListener)

    if (document.contains(grill.instances?.['grill']?.iframe)) {
      grill.setConfig(config)
    } else {
      grill.init(config)
    }

    return () => {
      if (listener) grill.removeMessageListener(eventListener)
    }
  }, [ spaceId, pathname ])

  return (
    <div
      {...props}
      id='grill'
      className={clsx(
        props.className, 
        'transition-opacity',
        !isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    />
  )
}
