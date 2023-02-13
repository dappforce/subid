export type StakingInfo = {
  avgStaked: string
  medianComm: number
  minNominated: string
  nominators: string[]
  maxAPY: string
  nominateIds: string[]
  totalStaked: string
  validators: Record<string, ValidatorInfo>
  validatorIds: string[]
  waitingIds: string[]
  era: string
}

type Exposure = {
  own: string
  total: string
  others: Record<string, string> 
}

export type ValidatorInfo = {
  accountId: string
  bondOther: string
  bondOwn: string
  bondTotal: string
  commissionPer: number
  exposure: Exposure
  apy?: string
  isActive: boolean
  isBlocking: boolean
  key: string
  numNominators: number
  validatorPrefs?: any
}

export type StakingInfoProps = {
  network: string
  reload?: boolean
}