import React from 'react'
import { Button, Col, FormInstance, Input, Row } from 'antd'
import { MutedSpan } from '../utils/MutedText'
import { Form } from 'antd'
import { convertToBalanceWithDecimal, FormatBalance } from '../common/balances'
import BigNumber from 'bignumber.js'
import { fieldName, setAndValidateField } from './utils'
import { nonEmptyStr } from '@subsocial/utils'
import { BN_ZERO } from '@polkadot/util'
import { useTipContext } from './TipModalContext'
import styles from './index.module.sass'
import { useBalancesByNetwork } from 'src/rtk/features/balances/balancesHooks'
import { useTranslation } from 'react-i18next'
import { getTransferableBalance } from 'src/utils/balance'
import { BIGNUMBER_ZERO } from '../../config/app/consts'

type ContributionAmountInputProps = {
  form: FormInstance
}

export const TipAmountInput = React.memo(({ form }: ContributionAmountInputProps) => {
  const { sender, infoByNetwork, network, currency, setAmount } = useTipContext()
  const decimals = infoByNetwork?.tokenDecimals[0]
  const { t } = useTranslation()

  const balancesByCurrency = useBalancesByNetwork({ address: sender, network, currency })
  const availableBalance = balancesByCurrency ? getTransferableBalance(balancesByCurrency) : BN_ZERO

  const maxAmount = decimals ? convertToBalanceWithDecimal(availableBalance.toString(), decimals) : BIGNUMBER_ZERO

  const label = (
    <Row justify='space-between' className='w-100'>
      <Col>{`${t('donation.amount')}:`}</Col>
      <Col>
        <MutedSpan>{`${t('donation.balance')}: `}</MutedSpan>
        {network ? <FormatBalance value={availableBalance} decimals={decimals} currency={currency} /> : 0}
      </Col>
    </Row>
  )

  const setMaxAmount = () => setAndValidateField(form, fieldName('amount'), maxAmount.toString())

  const maxBtn = (
    <Button type='link' onClick={setMaxAmount} className='font-weight-semibold' size='small'>
      {t('donation.max')}
    </Button>
  )

  return (
    <Form.Item
      name={fieldName('amount')}
      label={label}
      className={styles.AmountFormInput}
      required
      rules={[
        ({ getFieldValue }: any) => ({
          async validator () {
            const value = getFieldValue(fieldName('amount'))

            let amount = new BigNumber(value)
            let err = ''

            if (!value || amount.isNaN() || amount.isZero()) {
              amount = BIGNUMBER_ZERO
            } else if (amount.gt(maxAmount)) {
              err = t('donation.donationFailed')
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
})
