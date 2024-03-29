import clsx from 'clsx'
import { ChangeEventHandler, useEffect, useRef } from 'react'
import Input from '../tailwind-components/inputs/Input'
import Button from '../tailwind-components/Button'
import { useBalancesByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import { calculateBalanceForStaking } from 'src/utils/balance'
import { BN_ZERO } from '@polkadot/util'
import {
  balanceWithDecimal,
  convertToBalanceWithDecimal,
} from '@subsocial/utils'
import { BIGNUMBER_ZERO } from 'src/config/app/consts'
import { FormatBalance } from 'src/components/common/balances'
import BN from 'bignumber.js'
import { useStakingConsts } from 'src/rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import { StakingModalVariant } from './StakeModal'
import { useLazyConnectionsContext } from '../../lazy-connection/LazyConnectionContext'
import { useBackerLedger } from '@/rtk/features/creatorStaking/backerLedger/backerLedgerHooks'

type CommonAmountInputProps = {
  setAmount: (amount: string) => void
  inputError?: string
  setInputError: (error?: string) => void
  amount?: string
  tokenSymbol?: string
  decimals?: number
  label: string
  balanceLabel?: string
  spaceId?: string
  modalVariant?: StakingModalVariant
}

type AmountInputProps = CommonAmountInputProps & {
  balanceValue?: JSX.Element
  validateInput: (amountValue: string) => void
  onMaxAmountClick?: () => void
  className?: string
}

export const StakeOrIncreaseStakeAmountInput = (
  props: CommonAmountInputProps
) => {
  const { tokenSymbol, decimals, setInputError, modalVariant } = props
  const myAddress = useMyAddress()
  const stakingConsts = useStakingConsts()
  const { getApiByNetwork } = useLazyConnectionsContext()

  const { minimumStakingAmount, minimumRemainingAmount } = stakingConsts || {}

  const { currencyBalance: balancesByCurrency } = useBalancesByNetwork({
    address: myAddress,
    network: 'subsocial',
    currency: tokenSymbol,
  })

  const availableBalance = balancesByCurrency
    ? calculateBalanceForStaking(balancesByCurrency, 'crestake')
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

    props.setAmount(!maxAmount.lte(0) ? maxAmount.toString() : '')
    validateInput(maxAmount.toString())
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
    } else if (amountWithDecimals.gt(new BN(availableBalance.toString()))) {
      setInputError('Amount exceeds available balance')
    } else if (amountWithDecimals.lte(new BN(0))) {
      setInputError('Amount must be greater than 0')
    } else if (
      minimumRemainingAmount &&
      new BN(availableBalance.toString())
        .minus(amountWithDecimals)
        .lt(minimumRemainingAmount)
    ) {
      const minimumRemainingAmountWithDecimals = convertToBalanceWithDecimal(
        minimumRemainingAmount,
        decimals || 0
      )

      setInputError(
        `You must leave at least ${minimumRemainingAmountWithDecimals} SUB in your account`
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
  const { tokenSymbol, decimals, setInputError } = props

  const { minimumStakingAmount } = stakingConsts || {}

  const backerLedger = useBackerLedger(myAddress)

  const { ledger } = backerLedger || {}

  const { locked } = ledger || {}

  const onMaxAmountClick = () => {
    const maxAmount =
      decimals && locked
        ? convertToBalanceWithDecimal(locked, decimals)
        : BIGNUMBER_ZERO

    props.setAmount(!maxAmount.lte(0) ? maxAmount.toString() : '')

    validateInput(maxAmount.toString())
  }

  const balanceValue = (
    <FormatBalance
      value={locked}
      decimals={decimals}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const validateInput = (amountValue: string) => {
    const amountWithDecimals = balanceWithDecimal(amountValue, decimals || 0)

    const canUnstake =
      locked &&
      new BN(locked)
        .minus(amountWithDecimals)
        .gte(new BN(minimumStakingAmount || 0))

    if (amountWithDecimals.lte(new BN(0))) {
      setInputError('Amount must be greater than 0')
    } else if (
      (minimumStakingAmount && amountValue && canUnstake) ||
      amountWithDecimals.eq(locked || '0')
    ) {
      setInputError(undefined)
    } else if (locked && amountWithDecimals.gt(new BN(locked))) {
      setInputError('Amount exceeds staked value')
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
    </div>
  )
}

export const AmountInput = ({
  amount,
  setAmount,
  inputError,
  balanceLabel,
  label,
  balanceValue,
  onMaxAmountClick,
  validateInput,
  className,
}: AmountInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const amountInputValue = e.target.value

    validateInput(amountInputValue)

    setAmount(amountInputValue)
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div>
      <div className='mb-2 flex justify-between text-sm font-normal leading-4 text-text-muted'>
        <div>{label}</div>
        {balanceValue && (
          <div>
            {balanceLabel}:{' '}
            <span className={clsx('font-semibold text-black')}>
              {balanceValue}
            </span>
          </div>
        )}
      </div>
      <Input
        ref={inputRef}
        step={0.1}
        min={0}
        value={amount}
        placeholder='0'
        autoFocus={true}
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
          'h-[48px] pr-16 text-base leading-6 ring-1 ring-inset ring-indigo-500',
          'focus:outline-none focus:ring-1 focus:ring-indigo-500',
          'hover:outline-none hover:ring-1 hover:ring-indigo-500',
          'focus-visible:!ring-1 focus-visible:ring-indigo-500',
          '!bg-[#FAFBFF] hover:bg-[#FAFBFF] text-black',
          className
        )}
      />
    </div>
  )
}
