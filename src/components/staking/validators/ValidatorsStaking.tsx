import ValidatorStakingForm from './starNominating/ValidatorStakingForm'
import ValidatorsStakingSection from './validatorStaking/index'
import StartScreen from './startScreen'
import { useMyAddress } from '../../providers/MyExtensionAccountsContext'
import { NominatingStakingContextWrapper } from './contexts/NominatingContext'
import { 
  StakingContextWrapper, 
  useStakingContext, 
  StakingStepsEnum 
} from './contexts/StakingScreenContext'
import { useFetchStakingProps } from 'src/rtk/features/validators/stakingProps/stakingPropsHooks'
import { useFetchNominatorsInfo } from '../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'
import { useFetchStakingInfo } from '../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import clsx from 'clsx'

type ValidatorsStakingProps = {
  network: string
}

const InnerValidatorsStaking = ({ network }: ValidatorsStakingProps) => {
  const myAddress = useMyAddress()
  
  useFetchStakingInfo(network)
  useFetchStakingProps(network)
  useFetchNominatorsInfo(network, myAddress)
  
  const { currentStakingStep } = useStakingContext()

  switch (currentStakingStep) {
    case StakingStepsEnum.Start:
      return <StartScreen network={network} />
    case StakingStepsEnum.Nominate:
      return <ValidatorStakingForm network={network} />
    case StakingStepsEnum.Staking:
      return <ValidatorsStakingSection network={network} />
    default:
      return <StartScreen network={network} />
  }
}

const ValidatorsStaking = ({ network }: ValidatorsStakingProps) => {
  const { isMobile } = useResponsiveSize()

  return (
    <StakingContextWrapper network={network}>
      <NominatingStakingContextWrapper network={network}>
        <div className={clsx({ [ 'pl-3 pr-3']: isMobile })}>
          <InnerValidatorsStaking network={network} />
        </div>
      </NominatingStakingContextWrapper>
    </StakingContextWrapper>
  )
}

export default ValidatorsStaking
