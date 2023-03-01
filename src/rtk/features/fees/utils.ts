export type TransferFeeParams = {
  token: string
  source: string
  dest?: string
}
export function generateTransferFeeId (params: TransferFeeParams) {
  return `transfer-${params.token}-${params.source}-${params.dest ?? ''}`
}
