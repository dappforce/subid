import { createContext, useContext, useEffect, useState } from 'react'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'

export enum StakingDashboardStepsEnum {
  Start = -1,
  Dashboard, 
  ChangeValidators
}

export type StakingDashboardContextState = {
  currentStakingStep: number
  setCurrentStakingStep: (currentStep: number) => void
}

const StakingDashboardContext = createContext<StakingDashboardContextState>({} as any)

type StakingDashboardContextWrapperProps = {
  network: string
}

export const StakingDashboardContextWrapper: React.FC<StakingDashboardContextWrapperProps> = ({
  children,
  network,
}) => {
  const myAddress = useMyAddress()
  const [ currentStakingStep, setCurrentStakingStep ] = useState(StakingDashboardStepsEnum.Dashboard) 

  useEffect(() => setCurrentStakingStep(StakingDashboardStepsEnum.Dashboard), [ network, myAddress ])

  const value = {
    currentStakingStep,
    setCurrentStakingStep,
  }

  return (
    <StakingDashboardContext.Provider value={value}>
      {children}
    </StakingDashboardContext.Provider>
  )
}

export const useStakingDashboardContext = () => useContext(StakingDashboardContext)
