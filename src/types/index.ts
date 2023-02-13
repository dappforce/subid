// TODO Fix this copypasta from: backend/src/services/crowdloan/types.ts#L4
export type RelayChain = 'polkadot' | 'kusama'

export type ChainWithIdentity = 'polkadot' | 'kusama' | 'shiden'

export type CrowdloanStatus = 'Active' | 'Winner' | 'Ended'

export enum CONTENT_TYPES {
  image = 'image',
  gif = 'gif',
  video = 'video',
  model = '3d',
  audio = 'audio',
  pdf = 'pdf',
  unknown = 'unknown',
}
