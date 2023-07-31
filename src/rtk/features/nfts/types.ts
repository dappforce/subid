export type Nft = {
  id: string
  name: string
  image: string
  price?: string
  animationUrl?: string
  contentType?: string
  link: string
  account: string
  network: string
  stubImage: string
}

export type NftNetwork =
  | 'rmrk1'
  | 'rmrk2'
  | 'statemine'

export type Nfts = Record<NftNetwork, Nft[]>
