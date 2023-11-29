import React from 'react'
import { Button, Col, FormInstance, Input, Row, Form } from 'antd'
import BigNumber from 'bignumber.js'
import { nonEmptyStr } from '@subsocial/utils'
import { useTranslation } from 'react-i18next'
import { ChainInfo } from '../../../../rtk/features/multiChainInfo/types'
import { FormatBalance } from '../../../common/balances/Balance'
import { MutedSpan } from '../../../utils/MutedText'
import { setAndValidateField, fieldName } from '../utils'
import { convertToBalanceWithDecimal } from '../../../common/balances/utils'
import styles from '../StakingTable.module.sass'
import { Action } from './StakingActionButtons'
import { BIGNUMBER_ZERO } from '../../../../config/app/consts'
import { BN } from '@polkadot/util'

type StakeAmountInputProps = {
  form: FormInstance
  network: string
  currency: string
  chainInfo: ChainInfo
  availableBalance: BN
  setAmount: (amount: string) => void
  delegationAmount?: string
  isFirstDelegation: boolean
  action: Action
}

export const StakeAmountInput = ({
  form,
  network,
  currency,
  setAmount,
  chainInfo,
  delegationAmount,
  isFirstDelegation,
  availableBalance,
  action
}: StakeAmountInputProps) => {
  const { t } = useTranslation()

  const decimals = chainInfo?.tokenDecimals[0]
  const { minDelegaton, minDelegatorStk } = chainInfo?.staking || {}

  const maxAmount = decimals ? convertToBalanceWithDecimal(availableBalance.toString(), decimals) : BIGNUMBER_ZERO
  const maxDelegatedAmount = decimals && delegationAmount ? convertToBalanceWithDecimal(delegationAmount, decimals) : BIGNUMBER_ZERO

  const maxDelegated = decimals && delegationAmount
    ? convertToBalanceWithDecimal(delegationAmount.toString(), decimals)
    : BIGNUMBER_ZERO

  const minStake = isFirstDelegation ? minDelegatorStk : minDelegaton

  const minStakeWithDecimals = decimals && minStake ? convertToBalanceWithDecimal(minStake, decimals) : BIGNUMBER_ZERO
  
  const label = (
    <Row justify='space-between' className='w-100'>
      <Col>{`${t('staking.modal.amount')}:`}</Col>
      <Col>
        <MutedSpan>{delegationAmount ? t('staking.modal.staked') : `${t('donation.balance')}: `}</MutedSpan>
        {network ? <FormatBalance
          value={delegationAmount ? delegationAmount : availableBalance}
          decimals={decimals}
          currency={currency}
        /> : 0}
      </Col>
    </Row>
  )

  const setMaxAmount = () =>
    setAndValidateField(form, fieldName('amount'), action === 'unstake' ? maxDelegatedAmount.toString() : maxAmount.toString())

  const maxBtn = (
    <Button ghost type='primary' onClick={setMaxAmount} size='small'>
      {t('donation.max')}
    </Button>
  )

  return (
    <Form.Item
      name={fieldName('amount')}
      label={label}
      className={styles.StakingAmountInput}
      required
      rules={[
        ({ getFieldValue }: any) => ({
          async validator () {
            const value = getFieldValue(fieldName('amount'))

            let amount = new BigNumber(value)

            let err = ''

            if (!value || amount.isNaN() || amount.isZero()) {
              amount = BIGNUMBER_ZERO
              err = 'Amount must be greater than zero'
            } else if (action !== 'unstake' && amount.gt(maxAmount)) {
              err = t('staking.modal.stakeFailed')
            } else if (action === 'unstake' && amount.gt(maxDelegated)) {
              err = t('staking.modal.unstakeFailed')
            }
            else if (action === 'stake' && amount.lt(minStakeWithDecimals)) {
              err = t('staking.modal.minStake', { action, minStake: minStakeWithDecimals.toString(), currency })
            }
            else if (
              action === 'unstake' &&
              delegationAmount &&
              maxDelegated.minus(amount).lt(minStakeWithDecimals) &&
              !amount.eq(maxDelegatedAmount)
            ) {
              err = t('staking.modal.minUnstake', { minStake: minStakeWithDecimals.toString(), currency })
            }

            if (nonEmptyStr(err)) {
              return Promise.reject(err)
            }

            setAmount && setAmount(value)
            return Promise.resolve()
          }
        })
      ]}
    >
      <Input type='number' min='0' step='0.1' size='large' suffix={maxBtn} />
    </Form.Item>
  )
}
