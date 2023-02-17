import { AccountIdentitiesRecord } from '../../../rtk/features/identities/identitiesSlice'
import { CollatorStakingInfo } from '../types'
import { AccountPreview, getDecimalsAndSymbol, getBalanceWithDecimals } from '../utils'
import { getSubsocialIdentityByAccount } from '../../../rtk/features/identities/identitiesHooks'
import { toGenericAccountId } from '../../../rtk/app/util'
import { StakingCandidateInfoRecord } from '../../../rtk/features/stakingCandidates/utils'
import { MultiChainInfo } from '../../../rtk/features/multiChainInfo/types'
import { BalanceView } from '../../homePage/address-views/utils/index'
import { isDef } from '@subsocial/utils'
import { ActionButtons } from './stakeModal/StakingActionButtons'
import { StakingDelegatorStateEntityRecord } from '../../../rtk/features/stakingDelegators/delegatorState/types'
import { startWithUpperCase } from '../../utils/index'
import { UnstakedBalances } from './utils'
import { BIGNUMBER_ZERO } from '../../../config/app/consts'

type ParseStakingInfoProps = {
  stakingCandidates?: string[]
  selectedCandidatesByNetwork?: string[]
  network: string
  address?: string
  stakingInfoEntities: StakingCandidateInfoRecord
  stakingDelegatorStateEntities: StakingDelegatorStateEntityRecord
  chainsInfo: MultiChainInfo
  identities?: AccountIdentitiesRecord
}

const parseStakingInfo = ({
  stakingCandidates,
  network,
  chainsInfo,
  address,
  stakingInfoEntities,
  stakingDelegatorStateEntities,
  selectedCandidatesByNetwork,
  identities
}: ParseStakingInfoProps): CollatorStakingInfo[] => {
  const chainInfo = chainsInfo[network]
  const { tokenSymbols, nativeToken } = chainInfo

  const nativeSymbol = nativeToken || tokenSymbols[0]

  const { decimal } = getDecimalsAndSymbol(chainInfo, nativeSymbol)

  const candidatesInfo = stakingCandidates?.map((candidate, i) => {
    const candidateInfo = stakingInfoEntities[candidate]?.info

    const genericCandidateAddress = toGenericAccountId(candidate)
    const genericAddress = toGenericAccountId(address)

    const { totalCounted, delegationCount, bond } = candidateInfo || {}

    const candidateStatus = selectedCandidatesByNetwork?.includes(candidate) ? 'active' : 'waiting'

    const { delegations } = stakingDelegatorStateEntities[genericAddress]?.state || {}

    const { amount: stakedAmount }
      = delegations?.find(({ owner }) => toGenericAccountId(owner) === genericCandidateAddress) || {}

    const totalCountedWithDecimal = getBalanceWithDecimals({ totalBalance: totalCounted, decimals: decimal })

    const bondWithDecimal = getBalanceWithDecimals({ totalBalance: bond, decimals: decimal })

    const stakeAmountWithDeciaml = stakedAmount
      ? getBalanceWithDecimals({ totalBalance: stakedAmount, decimals: decimal })
      : BIGNUMBER_ZERO

    const selfStake = <BalanceView value={bondWithDecimal.toString()} symbol={nativeSymbol} withSymbol={false} />
    const total = <BalanceView value={totalCountedWithDecimal.toString()} symbol={nativeSymbol} withSymbol={false} />
    const staked = <BalanceView value={stakeAmountWithDeciaml.toString()} symbol={nativeSymbol} withSymbol={false} />

    const subsocialIdentity = getSubsocialIdentityByAccount(candidate, identities)

    const name = <AccountPreview
      account={candidate}
      name={startWithUpperCase(network)}
      avatar={subsocialIdentity?.image}
      withQr={false}
      withAddress={true}
    />

    return {
      key: i.toString(),
      name,
      staked,
      unstaked: <UnstakedBalances
        network={network}
        candidate={candidate}
        address={address}
        nativeSymbol={nativeSymbol}
        decimals={decimal}
      />,
      stakedValue: stakeAmountWithDeciaml,
      total,
      selfStake,
      stakers: delegationCount,
      actions: <ActionButtons address={candidate} network={network} />,
      candidateStatus
    } as CollatorStakingInfo
  }).filter(isDef)


  return candidatesInfo || []
}

export default parseStakingInfo