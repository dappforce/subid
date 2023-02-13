import { useChainToken } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { useVesting } from 'src/rtk/features/vesting/vestingHooks'
import { getBalanceWithDecimals, LabelWithShortMoneyFormat } from '../utils'
import BigNumber from 'bignumber.js'
import { HTMLProps } from 'react'
import { MutedDiv } from 'src/components/utils/MutedText'

export interface VestingCrowdloanBalanceProps extends HTMLProps<HTMLDivElement> {
  network: string
  claimable: string | BigNumber
  remaining: string | BigNumber
  oneLine?: boolean
}

export function VestingCrowdloanBalance ({
  network,
  claimable,
  remaining,
  oneLine,
  ...props
}: VestingCrowdloanBalanceProps) {
  const { nativeTokenDecimal, nativeToken } = useChainToken(network)

  const parsedClaimable = getBalanceWithDecimals({ totalBalance: claimable.toString() || '0', decimals: nativeTokenDecimal })
  const parsedRemaining = getBalanceWithDecimals({ totalBalance: remaining.toString() || '0', decimals: nativeTokenDecimal })

  if (parsedRemaining.isZero()) {
    return <MutedDiv {...props}>−</MutedDiv>
  }

  return (
    <div {...props}>
      <LabelWithShortMoneyFormat
        style={{ whiteSpace: 'nowrap' }}
        noFractionForZero
        symbol=''
        value={parsedClaimable}
      />
      {oneLine ? ' / ' : <>/<br /></>}
      <LabelWithShortMoneyFormat
        style={{ whiteSpace: 'nowrap' }}
        noFractionForZero
        symbol={nativeToken}
        value={parsedRemaining}
      />
    </div>
  )
}

export interface AccountVestingCrowdloanBalanceProps extends Omit<VestingCrowdloanBalanceProps, 'claimable' | 'remaining'> {
  address: string
}
export function AccountVestingCrowdloanBalance ({ address, network, ...props }: AccountVestingCrowdloanBalanceProps) {
  const vestingData = useVesting(address, network)
  return (
    <VestingCrowdloanBalance
      {...props}
      claimable={vestingData?.vestingData?.claimable ?? '0'}
      remaining={vestingData?.vestingData?.remaining ?? '0'}
      network={network}
    />
  )
}
