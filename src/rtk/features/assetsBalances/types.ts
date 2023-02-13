export type AssetsBalances = Record<string, AssetBalance>

export type AssetBalance = {
  balance: string
  isFrozen: boolean
}