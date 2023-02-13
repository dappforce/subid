import { inRange } from 'lodash'
import BN from 'bignumber.js'

const MINIMUM_INFLATION = 0.025 // min_annual_inflation

const INFLATION_IDEAL = 0.1

const STAKED_PORTION_IDEAL = 0.75 // ideal_stake

const INTEREST_IDEAL = INFLATION_IDEAL / STAKED_PORTION_IDEAL

const DECAY_RATE = 0.05 // fallof

export const calculateYearlyInflation = (stakedPortion: string) => {
  const stakedPortionNumber = new BN(stakedPortion).toNumber()

  const a = inRange(stakedPortionNumber, 0.0, STAKED_PORTION_IDEAL) 
    ? stakedPortionNumber * (INTEREST_IDEAL - MINIMUM_INFLATION / STAKED_PORTION_IDEAL)
    : (INTEREST_IDEAL * STAKED_PORTION_IDEAL - MINIMUM_INFLATION) * Math.pow(2, ((STAKED_PORTION_IDEAL - stakedPortionNumber) / DECAY_RATE))

  return MINIMUM_INFLATION + a
}