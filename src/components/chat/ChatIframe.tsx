import clsx from 'clsx'
import { ComponentProps, useEffect, useState } from 'react'
import grill, { GrillConfig, GrillEventListener } from '@subsocial/grill-widget'
import { useSendEvent } from '../providers/AnalyticContext'
import useWrapInRef from '../../hooks/useWrapInRef'
import { Resource } from '@subsocial/resource-discussions'
import {
  ChanelTypeChannel,
  ChanelTypeResource,
  GenerateGrillConfigParams,
} from './types'
import { useChatContext } from '../providers/ChatContext'
import { isCreatorStakingPage } from '../utils'

const creatorsHubId = '1218'

function generateGrillConfig ({
  hubId = 'polka',
  spaceId,
  metadata,
}: GenerateGrillConfigParams): GrillConfig {
  const settings = {
    enableInputAutofocus: true,
    enableBackButton: false,
    enableLoginButton: true,
  }

  const isCreatorStaking = isCreatorStakingPage()

  // TODO: remove this hack and improve the config for using hub instead of channel
  const hub = isCreatorStaking || spaceId ? { id: creatorsHubId } : { id: hubId }

  const channel = spaceId
    ? ({
        type: 'resource',
        resource: new Resource({
          schema: 'chain',
          chainType: 'substrate',
          chainName: 'subsocial',
          resourceType: 'creator',
          resourceValue: {
            id: spaceId,
          },
        }),
        metadata: metadata,
      } as ChanelTypeResource)
    : ({
        type: 'channel',
        id: '754',
      } as ChanelTypeChannel)

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

  useEffect(() => {
    const config = generateGrillConfig({ spaceId, metadata })

    config.onWidgetCreated = (iframe) => {
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
    grill.addUnreadCountListener(eventListener)

    if (grill.instances['grill']) {
      grill.setConfig(config)
    } else {
      grill.init(config)
    }

    return () => {
      if (listener) grill.removeUnreadCountListener(eventListener)
    }
  }, [ spaceId ])

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
