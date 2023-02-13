import CollatorStakingTable from '../../table/collatorStakingTable/CollatorStakingTable'
import { useFetchStakingRound } from '../../../rtk/features/stakingRound/stakingRoundHooks'
import { StakingContextWrapper } from './StakingContext'
import { CollatorStakingPageProps } from '../../main/CollatorStakingPage'
import dynamic from 'next/dynamic'

const StakingDashboard = dynamic(() => import('./StakingDashboard'), { ssr: false })

const InnerCollatorStalking = ({ network }: CollatorStakingPageProps) => {
  useFetchStakingRound(network)

  return <StakingContextWrapper network={network}>
    <StakingDashboard network={network} />
    <CollatorStakingTable network={network}/>
  </StakingContextWrapper>
}

const CollatorStaking = (props: CollatorStakingPageProps) => {
  return <InnerCollatorStalking {...props} />
}

export default CollatorStaking