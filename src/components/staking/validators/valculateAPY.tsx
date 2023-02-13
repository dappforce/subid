import BN from 'bignumber.js'
import { calculateYearlyInflation } from './calculateYearlyInflation'
import { BIGNUMBER_ONE, DAYS_IN_YEAR, PERIOD_MONTH } from '../../../config/app/consts'

const averageValidatorRewardPercentage = (totalStaked: string, totalIssuance: string) => {
  const stakedPortion = new BN(totalStaked).dividedBy(new BN(totalIssuance))

  const yearlyInflation = calculateYearlyInflation(stakedPortion.toString())

  return (new BN(yearlyInflation).multipliedBy(100).dividedBy(stakedPortion))
}

export const calculateAPYByValidator = (validatorsTotalStaked: string, totalStaked: string, validatorsSize: number, totalIssuance: string, validatorCommission: string) => {
  const averageValidatorStake = new BN(totalStaked).dividedBy(validatorsSize)

  const yearlyRewardPercentage = averageValidatorRewardPercentage(totalStaked, totalIssuance).multipliedBy(averageValidatorStake).dividedBy(validatorsTotalStaked) 
  
  return yearlyRewardPercentage.multipliedBy(BIGNUMBER_ONE.minus(new BN(validatorCommission).dividedBy(100))).toFixed(2)
}

type CalculateReturnsProps = {
  maxAPY: BN
  days: BN
  isCompound: boolean
}

export const calculateReturns = ({ maxAPY, days, isCompound }: CalculateReturnsProps) => {
  const a = maxAPY.dividedBy(100).plus(BIGNUMBER_ONE)
  const b = BIGNUMBER_ONE.dividedBy(DAYS_IN_YEAR)

  const c = Math.pow(a.toNumber(), b.toNumber())

  const dailyPercentage = new BN(c).minus(1)

  return calculateReward({ days, dailyPercentage, isCompound })
}

type CalculateRewardsProps = {
  days: BN
  dailyPercentage: BN
  isCompound: boolean
}

const calculateReward = ({ days, dailyPercentage, isCompound }: CalculateRewardsProps) => 
  isCompound 
    ? calculateCompoundPercentage(days, dailyPercentage) 
    : calculateSimplePercentage(days, dailyPercentage)

const calculateCompoundPercentage = (days: BN, dailyPercentage: BN) => {
  return (BIGNUMBER_ONE.plus(dailyPercentage)).pow(days).minus(1)
}

const calculateSimplePercentage = (days: BN, dailyPercentage: BN) => {
  return dailyPercentage.multipliedBy(days)
}

type RewardPersentage = {
  maxAPY: BN
}

export const monthlyPercentage = ({ maxAPY }: RewardPersentage) => 
  calculateReturns({ maxAPY, days: PERIOD_MONTH, isCompound: true })

export const yearlyPercentage = ({ maxAPY }: RewardPersentage) => 
  calculateReturns({ maxAPY, days: DAYS_IN_YEAR, isCompound: true })

export const payoutReturns = ({ maxAPY }: RewardPersentage) => 
  calculateReturns({ maxAPY, days: DAYS_IN_YEAR, isCompound: false })
