import clsx from 'clsx'
import { ChangeEventHandler } from 'react'
import Input from '../../tailwind-components/inputs/Input'
import Button from '../../tailwind-components/Button'
import { useBalancesByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { getTransferableBalance } from 'src/utils/balance'
import { BN_ZERO } from '@polkadot/util'
import {
  balanceWithDecimal,
  convertToBalanceWithDecimal,
} from '@subsocial/utils'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import { FormatBalance } from 'src/components/common/balances'
import BN from 'bignumber.js'
import { useStakerInfo } from 'src/rtk/features/creatorStaking/stakerInfo/stakerInfoHooks'
import { useStakingConsts } from 'src/rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import { StakingModalVariant } from './StakeModal'
import DaystoWithDraw from '../../utils/DaysToWithdraw'
import { useLazyConnectionsContext } from '../../../lazy-connection/LazyConnectionContext'

type CommonAmountInputProps = {
  setAmount: (amount: string) => void
  inputError?: string
  setInputError: (error?: string) => void
  amount: string
  tokenSymbol: string
  decimals?: number
  label: string
  balanceLabel: string
  spaceId: string
  modalVariant: StakingModalVariant
}

type AmountInputProps = CommonAmountInputProps & {
  balanceValue: JSX.Element
  validateInput: (amountValue: string) => void
  onMaxAmountClick?: () => void
}

export const StakeOrIncreaseStakeAmountInput = (
  props: CommonAmountInputProps
) => {
  const { tokenSymbol, decimals, setInputError, modalVariant } = props
  const myAddress = useMyAddress()
  const stakingConsts = useStakingConsts()
  const { getApiByNetwork } = useLazyConnectionsContext()

  const { minimumStakingAmount, minimumRemainingAmount } = stakingConsts || {}

  const balancesByCurrency = useBalancesByNetwork({
    address: myAddress,
    network: 'subsocial',
    currency: tokenSymbol,
  })

  const availableBalance = balancesByCurrency
    ? getTransferableBalance(balancesByCurrency)
    : BN_ZERO

  const onMaxAmountClick = async () => {
    const api = await getApiByNetwork('subsocial')

    const tx = api.tx.creatorStaking.stake(
      props.spaceId,
      availableBalance.toString()
    )

    const paymentInfo = myAddress ? await tx.paymentInfo(myAddress) : undefined

    const partialFee = paymentInfo?.partialFee

    const balance = partialFee
      ? new BN(availableBalance.toString())
          .minus(new BN(partialFee.toString()))
          .minus(new BN(minimumRemainingAmount || 0))
      : BIGNUMBER_ZERO

    const maxAmount =
      partialFee && decimals
        ? convertToBalanceWithDecimal(balance.toString(), decimals)
        : BIGNUMBER_ZERO

    props.setAmount(maxAmount.toString())
  }

  const balanceValue = (
    <FormatBalance
      value={availableBalance}
      decimals={decimals}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const validateInput = (amountValue: string) => {
    const amountWithDecimals = balanceWithDecimal(amountValue, decimals || 0)

    if (
      minimumStakingAmount &&
      amountWithDecimals.lt(new BN(minimumStakingAmount)) &&
      modalVariant === 'stake'
    ) {
      const minimumStakingAmountWithDecimals = convertToBalanceWithDecimal(
        minimumStakingAmount,
        decimals || 0
      )
      setInputError(
        `Amount must be greater than ${minimumStakingAmountWithDecimals} ${tokenSymbol}`
      )
    } else {
      setInputError(undefined)
    }
  }

  return (
    <AmountInput
      {...props}
      onMaxAmountClick={onMaxAmountClick}
      balanceValue={balanceValue}
      validateInput={validateInput}
    />
  )
}

export const UnstakeAmountInput = (props: CommonAmountInputProps) => {
  const myAddress = useMyAddress()
  const stakingConsts = useStakingConsts()
  const { tokenSymbol, decimals, spaceId, setInputError } = props

  const { minimumStakingAmount, unbondingPeriodInEras } = stakingConsts || {}

  const stakerInfo = useStakerInfo(spaceId, myAddress)

  const { info } = stakerInfo || {}

  const { totalStaked } = info || {}

  const maxAmount =
    decimals && totalStaked
      ? convertToBalanceWithDecimal(totalStaked, decimals)
      : BIGNUMBER_ZERO

  const onMaxAmountClick = () => {
    props.setAmount(maxAmount.toString())
  }

  const balanceValue = (
    <FormatBalance
      value={totalStaked}
      decimals={decimals}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const validateInput = (amountValue: string) => {
    const amountWithDecimals = balanceWithDecimal(amountValue, decimals || 0)

    const canUnstake =
      totalStaked &&
      new BN(totalStaked)
        .minus(amountWithDecimals)
        .gte(new BN(minimumStakingAmount || 0))

    if (
      (minimumStakingAmount && amountValue && canUnstake) ||
      amountWithDecimals.eq(totalStaked || '0')
    ) {
      setInputError(undefined)
    } else {
      const minimumStakingAmountWithDecimals = convertToBalanceWithDecimal(
        minimumStakingAmount || '0',
        decimals || 0
      )

      setInputError(
        `${minimumStakingAmountWithDecimals} ${tokenSymbol} minimum stake, please leave ${minimumStakingAmountWithDecimals}+ ${tokenSymbol} or unstake all`
      )
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <AmountInput
        {...props}
        balanceValue={balanceValue}
        onMaxAmountClick={onMaxAmountClick}
        validateInput={validateInput}
      />

      <div className='px-4 py-2 bg-indigo-50 text-text-primary rounded-[20px]'>
        ℹ️ Unstaking takes about{' '}
        <DaystoWithDraw unbondingPeriodInEras={unbondingPeriodInEras} /> before
        you can withdraw
      </div>
    </div>
  )
}

const AmountInput = ({
  amount,
  setAmount,
  inputError,
  balanceLabel,
  label,
  balanceValue,
  onMaxAmountClick,
  validateInput,
}: AmountInputProps) => {
  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const amountInputValue = e.target.value

    validateInput(amountInputValue)

    setAmount(amountInputValue)
  }

  return (
    <div>
      <div className='mb-2 flex justify-between text-sm font-normal leading-4 text-text-muted'>
        <div>{label}</div>
        <div>
          {balanceLabel}:{' '}
          <span className={clsx('font-semibold text-black')}>
            {balanceValue}
          </span>
        </div>
      </div>
      <Input
        step={0.1}
        min={0}
        value={amount}
        autoFocus
        onChange={onInputChange}
        error={inputError}
        rightElement={() => (
          <div>
            <Button
              variant='transparent'
              className={clsx(
                '!absolute bottom-0 right-3 top-0 my-auto !p-1 text-indigo-400',
                'hover:!text-indigo-500 hover:!ring-0'
              )}
              onClick={() => onMaxAmountClick && onMaxAmountClick()}
            >
              Max
            </Button>
          </div>
        )}
        type='number'
        className={clsx(
          'h-[54px] pr-16 text-base leading-6 ring-1 ring-inset ring-gray-500',
          'focus:outline-none focus:ring-1 focus:ring-gray-400',
          'hover:outline-none hover:ring-1 hover:ring-gray-400',
          'focus-visible:!ring-1 focus-visible:ring-gray-400',
          'bg-slate-200 text-black'
        )}
      />
    </div>
  )
}
