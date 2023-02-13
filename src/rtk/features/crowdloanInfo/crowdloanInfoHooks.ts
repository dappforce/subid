import { useAppSelector } from '../../app/store'
import { selectCrowdloanInfo } from './crowdloanInfoSlice'
import { CrowdloanInfo } from '../../../components/identity/types'
import { RelayChain } from '../../../types/index'

export const useCrowdloanInfo = (relayChain: RelayChain) => {
  return useAppSelector<CrowdloanInfo[] | undefined>((state) => selectCrowdloanInfo(state, relayChain))
}
