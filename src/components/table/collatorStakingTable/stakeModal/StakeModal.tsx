import { Modal, Form, Select, Button } from 'antd'
import { useIdentities } from 'src/rtk/features/identities/identitiesHooks'
import Name from '../../../homePage/address-views/Name'
import { toGenericAccountId } from '../../../../rtk/app/util'
import { useMyExtensionAddresses, useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import { SelectAccount } from '../../../tips/TipModal'
import { fieldName, getParamsByAction } from '../utils'
import { useState } from 'react'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { convertAddressToChainFormat } from '../../../utils/index'
import { StakeAmountInput } from './StakeAmountInput'
import styles from '../StakingTable.module.sass'
import { useStakingDelegatorsStateByNetwork } from '../../../../rtk/features/stakingDelegators/stakingDelegatorHooks'
import { useTranslation } from 'react-i18next'
import { ActionTxButton, Action } from './StakingActionButtons'
import clsx from 'clsx'
import { useBalancesByNetwork } from '../../../../rtk/features/balances/balancesHooks'
import { BN_ZERO } from '@polkadot/util'
import { useLazyConnectionsContext } from '../../../lazy-connection/LazyConnectionContext'
import BN from 'bignumber.js'
import { convertToBalanceWithDecimal } from 'src/components/common/balances'
import { getTransferableBalance } from 'src/utils/balance'

type StakingModalBodyProps = {
  address: string
  network: string
  hide: () => void
  action: Action
}

const StakingModalBody = ({ address, network, hide, action }: StakingModalBodyProps) => {
  const [ form ] = Form.useForm()
  const myAddress = useMyAddress()
  const chainsInfo = useChainInfo()
  const injectedAccounts = useMyExtensionAddresses()
  const { t } = useTranslation()
  const { getApiByNetwork, isConnecting } = useLazyConnectionsContext()

  const accountsForChoosing = injectedAccounts.map(x => x.address)

  const stakingDelegatorStateEntities = useStakingDelegatorsStateByNetwork(network, accountsForChoosing)

  const [ delegator, setDelegator ] = useState<string>(myAddress || '')
  const [ amount, setAmount ] = useState<string>()

  const chainInfoByNetwork = chainsInfo[network]

  const { ss58Format, nativeToken, tokenSymbols, tokenDecimals } = chainInfoByNetwork || {}
  const decimals = tokenDecimals[0]

  const currency = nativeToken || tokenSymbols[0]
  const balancesByCurrency = useBalancesByNetwork({ address: toGenericAccountId(delegator), network, currency })

  const availableBalance = balancesByCurrency ? getTransferableBalance(balancesByCurrency) : BN_ZERO

  const delegatorState = stakingDelegatorStateEntities[delegator]

  const delegations = delegatorState?.state?.delegations

  const isFirstDelegation = !!delegations?.length
  
  const delegationAmount = action === 'unstake' ? delegations?.find(({ owner }) =>
  toGenericAccountId(owner) === toGenericAccountId(address))?.amount : undefined
  
  const onSelectChange = (delegator: string) => {
    setDelegator(convertAddressToChainFormat(delegator, ss58Format) || delegator)
  }

  return <Form form={form} layout='vertical' className='mt-0'>
    <Form.Item name={fieldName('delegator')} label={t('staking.modal.staker')} required>
      <Select size='large' defaultValue={delegator} style={{ width: '100%' }} onChange={onSelectChange}>
        {accountsForChoosing?.map((account) => (
          <Select.Option key={account} value={account}>
            <SelectAccount address={account} ss58Format={ss58Format} />
          </Select.Option>
        ))}
      </Select>
    </Form.Item>

    <StakeAmountInput
      form={form}
      network={network}
      availableBalance={availableBalance}
      chainInfo={chainInfoByNetwork}
      isFirstDelegation={isFirstDelegation}
      delegationAmount={delegationAmount}
      setAmount={setAmount}
      currency={currency}
      action={action}
    />
    <div className={styles.StakingActionButtons}>
      <Button type='primary' ghost size='large' className='mr-3' block onClick={hide}>{t('buttons.close')}</Button>
      <ActionTxButton
        stakeForm={form}
        getApiByNetwork={getApiByNetwork}
        candidate={address}
        delegator={delegator}
        disabled={availableBalance.isZero() || isConnecting}
        network={network}
        chainInfo={chainInfoByNetwork}
        amount={amount}
        hide={hide}
        action={delegationAmount && amount && new BN(amount).eq(new BN(convertToBalanceWithDecimal(delegationAmount, decimals)))
          ? 'unstakeAll'
          : action}
      />
    </div>
  </Form>
}

type StakingModalProps = {
  open: boolean
  hide: () => void
  address: string
  network: string
  action: Action
}


const StakingModal = ({ open, hide, address, network, action }: StakingModalProps) => {
  const identities = useIdentities(address)
  const { t } = useTranslation()

  const { title } = getParamsByAction(t)[action]

  return <Modal
    visible={open}
    title={<h3 className='font-weight-bold m-0'>
      {title} {<Name identities={identities} address={address} />}
    </h3>}
    footer={null}
    width={600}
    destroyOnClose
    className={clsx('DfStakingModal', styles.StakingModal)}
    onCancel={hide}
  >
    <StakingModalBody address={address} network={network} hide={hide} action={action} />
  </Modal>
}

export default StakingModal
