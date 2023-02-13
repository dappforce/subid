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
  | 'unique'
  | 'rmrk1'
  | 'rmrk2'
  | 'statemine'
  | 'acala'
  | 'karura'

export type Nfts = Record<NftNetwork, Nft[]>
