import { createContext, useContext, useEffect, useState } from 'react'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import { isEmptyObj } from '@subsocial/utils'
import { Loading } from '../../../utils/index'
import { useNominatorInfo } from '../../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'

export enum StakingStepsEnum {
  None = -1,
  Start,
  Nominate, 
  Staking
}

export type StakingContextState = {
  currentStakingStep: number
  setCurrentStakingStep: (currentStep: number) => void
}

const StakingContext = createContext<StakingContextState>({} as any)

type StakingContextWrapperProps = {
  network: string
}

export const StakingContextWrapper: React.FC<StakingContextWrapperProps> = ({
  children,
  network,
}) => {
  const myAddress = useMyAddress()
  const { info, loading } = useNominatorInfo(network, myAddress)

  const isNominatorInfoEmpty = isEmptyObj(info) 

  const [ currentStakingStep, setCurrentStakingStep ] = useState(StakingStepsEnum.None)

  useEffect(() => {
    if(!info || isNominatorInfoEmpty && loading === true) return

    if(isNominatorInfoEmpty || info.controllerId === null) {
      setCurrentStakingStep(StakingStepsEnum.Start)
      return
    } else {
      setCurrentStakingStep(StakingStepsEnum.Staking)
    }
  }, [ isNominatorInfoEmpty, loading, network, myAddress ])

  const value = {
    currentStakingStep,
    setCurrentStakingStep,
  }

  return (
    <StakingContext.Provider value={value}>
      {loading === true ? <Loading label='Loading...' /> : children}
    </StakingContext.Provider>
  )
}

export const useStakingContext = () => useContext(StakingContext)
