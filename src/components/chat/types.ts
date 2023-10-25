import { GrillConfig } from '@subsocial/grill-widget'

export type ChanelTypeChannel = Extract<
  GrillConfig['channel'],
  { type: 'channel' }
>

export type ChanelTypeResource = Extract<
  GrillConfig['channel'],
  { type: 'resource' }
>

export type ResourceMetadata = {
  title: string
  body: string
  image: string
}

export type GenerateGrillConfigParams = {
  hubId?: string
  spaceId?: string
  metadata?: ResourceMetadata
}
