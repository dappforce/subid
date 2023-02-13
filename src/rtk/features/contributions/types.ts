export type CrowdloanContributions = Record<string, Contribution>

export type Contribution = {
  network: string
  contribution?: string
  leaseEnd?: string
  leaseStart?: string
  firstPeriod?: number
}