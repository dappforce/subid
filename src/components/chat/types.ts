type ResourceLike = {
  toResourceId: () => string
}

export type ChanelTypeChannel = {
  type: 'channel'
  id: string
}
export type ChanelTypeResource = {
  type: 'resource'
  resource: ResourceLike
  metadata: ResourceMetadata
}

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