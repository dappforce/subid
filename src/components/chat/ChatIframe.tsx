import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import grill, { GrillConfig } from '@subsocial/grill-widget'
import { useSendEvent } from '../providers/AnalyticContext'
import useWrapInRef from '../../hooks/useWrapInRef'
import { Resource } from '@subsocial/resource-discussions'
import {
  ChanelTypeChannel,
  ChanelTypeResource,
  GenerateGrillConfigParams,
} from './types'
import { useChatContext } from '../providers/ChatContext'

const creatorsHubId = '1022'

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

  const channel = spaceId
    ? ({
        type: 'resource',
        resource: new Resource({
          schema: 'chain',
          chainType: 'substrate',
          chainName: 'soonsocial',
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
    hub: { id: hubId || creatorsHubId },
    rootFontSize: '1rem',
    channel: {
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
    if (listener) {
      grill.addUnreadCountListener(listener)
    }
    grill.init(config)

    return () => {
      if (listener) grill.removeUnreadCountListener(listener)
    }
  }, [spaceId])

  return <div {...props} id='grill' className={clsx(props.className)} />
}
