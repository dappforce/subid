import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Avatar, Button, Col, Form, Modal, Row, Select } from 'antd'
import Name from '../homePage/address-views/Name'
import styles from '../homePage/address-views/utils/index.module.sass'
import { useMyExtensionAddresses } from '../providers/MyExtensionAccountsContext'
import BaseAvatar from '../utils/DfAvatar'
import {
  convertAddressToChainFormat,
  getIconUrl,
  toShortAddress,
} from '../utils'
import LazyTxButton from '../lazy-connection/LazyTxButton'
import { MutedDiv, MutedSpan } from '../utils/MutedText'
import { currencyNetworks } from './SupportedTokens'
import { getBalanceWithDecimal } from '../common/balances'
import { TipContextWrapper, useTipContext } from './TipModalContext'
import { fieldName } from './utils'
import { TipAmountInput } from './AmountInput'
import { capitalize } from 'lodash'
import { useResponsiveSize } from '../responsive'
import { isDef, toSubsocialAddress } from '@subsocial/utils'
import BN from 'bignumber.js'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { useRouter } from 'next/router'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchBalanceByNetwork } from '../../rtk/features/balances/balancesHooks'
import { showSuccessMessage } from '../utils/Message'
import { useTranslation } from 'react-i18next'
import { FormInstance } from 'rc-field-form'
import { isEthereumAddress } from '@polkadot/util-crypto'
import { BIGNUMBER_ZERO } from '../../config/app/consts'

type SelectAccountProps = {
  address: string
  ss58Format?: number
}

export const SelectAccount = ({ address, ss58Format }: SelectAccountProps) => {
  return <div className='d-flex justify-content-between w-100'>
    <div className='d-flex align-items-center'>
      <BaseAvatar address={address} avatar={undefined} size={24}/>
      <Name address={address} />
    </div>
    <div>
      {toShortAddress(convertAddressToChainFormat(address, ss58Format)!)}
    </div>
  </div>
}

type TransferButtonProps = {
  form: FormInstance
  recipient: string
}

const TransferButton = ({ form, recipient }: TransferButtonProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { sender, infoByNetwork, network, amount } = useTipContext()

  const decimals = infoByNetwork?.tokenDecimals[0]

  const buildTxParams = () => {
    const amount = new BN(form.getFieldValue(fieldName('amount')))

    if (!recipient || !decimals || amount.eq(BIGNUMBER_ZERO)) return []

    return [ recipient, getBalanceWithDecimal(amount.toString(), decimals).toString() ]
  }

  return <LazyTxButton
    accountId={sender}
    tx='balances.transfer'
    network={network!}
    disabled={!network || !sender || !amount}
    params={buildTxParams}
    onSuccess={() => {
      fetchBalanceByNetwork(dispatch, [ recipient, sender || '' ], network)
      showSuccessMessage(t('donation.donationSuccessful'))
    }}
    type='primary'
    size='large'
    block
    label={t('buttons.transfer')}
  />
}

const TipCard = () => {
  const [ form ] = Form.useForm()
  const { t } = useTranslation()

  const { query: { address } } = useRouter()
  const addressFromUrl = address.toString()

  const { isMobile } = useResponsiveSize()
  const chainInfo = useChainInfo()

  const { setCurrency, setSender, currency, infoByNetwork } =
    useTipContext()

  const injectedAccounts = useMyExtensionAddresses()

  const mySubsocialAddress = toSubsocialAddress(addressFromUrl)

  const accountsForChoosing = injectedAccounts
    .filter(x => !isEthereumAddress(x.address) && toSubsocialAddress(x.address) !== mySubsocialAddress)
    .map(x => x.address)

  const ss58Format = infoByNetwork?.ss58Format
  const recipient = convertAddressToChainFormat(addressFromUrl, ss58Format) || addressFromUrl

  const defaultSender = accountsForChoosing[0]

  useEffect(() => {
    if (!defaultSender) return

    setSender(defaultSender)
  }, [ defaultSender ])

  return <Form form={form} layout='vertical' className='mt-0 p-3'>
    <div className='d-flex align-items-center mb-3'>
      <div>
        <BaseAvatar address={recipient} avatar={undefined} size={64} />
      </div>
      <div>
        <MutedDiv>{t('donation.recipient')}:</MutedDiv>
        <Name address={recipient} />
        <MutedDiv style={{ fontSize: '0.85rem' }}>
          {isMobile ? toShortAddress(recipient) : recipient}
        </MutedDiv>
      </div>
    </div>

    <Form.Item name={fieldName('sender')} label={t('donation.sender')} required>
      <Select size='large' defaultValue={defaultSender} style={{ width: '100%' }} onChange={setSender}>
        {accountsForChoosing?.map((account) => (
          <Select.Option key={account} value={account}>
            <SelectAccount address={account} ss58Format={ss58Format} />
          </Select.Option>
        ))}
      </Select>
    </Form.Item>

    <Row>
      <Col span={isMobile ? 24 : 10}>
        <Form.Item name={fieldName('currency')} label={`${t('donation.currency')}:`} required className={clsx(!isMobile && 'bs-mr-3')}>
          <Select value={currency} onSelect={(currency: string) => setCurrency(currency)} size='large'>
            {currencyNetworks.map(([ currency, network ]) => {
              const isConnected = chainInfo[network].connected

              if (!isConnected) return undefined

              return (
                <Select.Option key={currency} value={currency}>
                  <Avatar size='small' src={getIconUrl(chainInfo[network].icon)} />
                  <span className='ml-2'>
                    {currency}
                    <MutedSpan className='ml-2'>{capitalize(network)}</MutedSpan>
                  </span>
                </Select.Option>
              )
            }).filter(isDef)}
          </Select>
        </Form.Item>
      </Col>
      <Col span={isMobile ? 24 : 14}>
        <TipAmountInput form={form} />
      </Col>
    </Row>

    <div>
      <TransferButton form={form} recipient={recipient} />
    </div>
  </Form>
}

export const Tip = () => {
  const [ opened, setOpened ] = useState(false)
  const [ showModal, setShowModal ] = useState(false)
  const { t } = useTranslation()

  const open = () => {
    setOpened(true)
    setShowModal(true)
  }

  const hide = () => {
    setShowModal(false)
  }

  return (
    <>
      {opened && <TipContextWrapper>
        <Modal
          visible={showModal}
          title={<h3 className='font-weight-bold m-0'>{t('donation.title')}</h3>}
          footer={null}
          width={600}
          className='DfTipInModal'
          onCancel={hide}
        >
          <TipCard />
        </Modal>
      </TipContextWrapper>}
      <Button type='primary' onClick={open} className={clsx(styles.FollowButton)}>
        {t('donation.donate')}
      </Button>
    </>
  )
}

export default Tip
