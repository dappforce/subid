import { createContext, useContext, useEffect, useState } from 'react'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'

const isFinishedStepsDefault = {
  stakeStepFinished: false,
  setValidatorsStepFinished: false,
}

export type RewardDestinationKey = 'Staked' | 'Account'


export type RewardDestination = Record<RewardDestinationKey, string | null>
const rewardDestinationDefault = { Staked: null } as RewardDestination

export enum NominatingStepsEnum {
  Disabled = -1,
  Stake, 
  SetValidators,
  Summary,
  Complete
}

type IsFinishedSteps = {
  stakeStepFinished: boolean
  setValidatorsStepFinished: boolean
}

export type NominatingStakingContextState = {
  currentStep: number
  controller: string
  rewardDestination: RewardDestination
  bond: string
  selectedValidators: string[]
  isFinishedSteps: IsFinishedSteps

  setCurrentStep: (currentStep: number) => void
  setController: (controller: string) => void
  setRewardDestination: (to: RewardDestination) => void
  setBond: (bond: string) => void
  setSelectedValidators: (validators: string[]) => void
  setIsFinishedSteps: ( isFinishedSteps: Partial<IsFinishedSteps> ) => void
}

const NominatingStakingContext = createContext<NominatingStakingContextState>({} as any)

type NominatingStakingContextWrapperProps = {
  network: string
}

export const NominatingStakingContextWrapper: React.FC<NominatingStakingContextWrapperProps> = ({
  children,
  network,
}) => {
  const myAddress = useMyAddress()

  const [ currentStep, setCurrentStep ] = useState(NominatingStepsEnum.Stake)
  const [ controller, setController ] = useState('')
  const [ rewardDestination, setRewardDestination ] = useState<RewardDestination>(rewardDestinationDefault)
  const [ bond, setBond ] = useState('0')
  const [ selectedValidators, setSelectedValidators ] = useState<string[]>([])
  const [ isFinishedSteps, setIsFinishedStepsInner ] = useState<IsFinishedSteps>(isFinishedStepsDefault)

  useEffect(() => {
    setController('')
    setRewardDestination({ Staked: null } as RewardDestination)
    setSelectedValidators([])
  }, [ network, myAddress ])

  const value = {
    currentStep,
    controller,
    rewardDestination,
    bond,
    selectedValidators,
    isFinishedSteps,

    setCurrentStep,
    setController,
    setRewardDestination,
    setBond,
    setSelectedValidators,
    setIsFinishedSteps: (newIsFinishedSteps: Partial<IsFinishedSteps>) =>  
      setIsFinishedStepsInner({ ...isFinishedSteps, ...newIsFinishedSteps })
  }

  return (
    <NominatingStakingContext.Provider value={value}>
      {children}
    </NominatingStakingContext.Provider>
  )
}

export const useNominatingStakingContext = () => useContext(NominatingStakingContext)
