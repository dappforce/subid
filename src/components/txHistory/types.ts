export type Transaction = {
  id: string
  txKind: string
  blockchainTag: string
  amount: string
  senderOrTargetPublicKey: string
  timestamp: string
  success: string
}
