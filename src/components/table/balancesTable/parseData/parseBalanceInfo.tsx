import BN from 'bignumber.js'
import React from 'react'
import {
  nonEmptyArr,
  isDef,
  isEmptyArray,
  pluralize,
  toShortMoney,
} from '@subsocial/utils'
import { MutedSpan } from '../../../utils/MutedText'
import {
  ChainData,
  getBalanceWithDecimals,
  otherBalances,
  getDecimalsAndSymbol,
  getPrice,
  getBalances,
  AccountPreview,
  getParentBalances,
} from '../../utils'
import styles from '../../Table.module.sass'
import { BalancesTableInfo } from '../../types'
import clsx from 'clsx'
import { BalanceEntityRecord } from '../../../../rtk/features/balances/balancesSlice'
import {
  MultiChainInfo,
  supportedNetworks,
  evmLikeNetworks,
} from '../../../../rtk/features/multiChainInfo/types'
import { convertAddressToChainFormat, SubIcon } from '../../../utils/index'
import { AccountIdentitiesRecord } from '../../../../rtk/features/identities/identitiesSlice'
import { AccountInfoByChain } from '../../../identity/types'
import { getSubsocialIdentityByAccount } from '../../../../rtk/features/identities/identitiesHooks'
import { BalanceView } from '../../../homePage/address-views/utils/index'
import { TFunction } from 'i18next'
import { Button, Tooltip } from 'antd'
import { FiSend } from 'react-icons/fi'
import { LinksButton } from '../../links/Links'
import { PnlInDollars, PriceChangedOn, allowedTokensByNetwork } from '../utils'
import { InfoCircleOutlined } from '@ant-design/icons'

const getAccountData = (info: AccountInfoByChain, t: TFunction) => {
  const { reservedBalance, freeBalance, lockedBalance } = info

  return [
    {
      key: 'locked',
      label: t('table.balances.locked'),
      value: lockedBalance?.toString() || '0',
      tooltipText:
        'Tokens that are locked, and cannot be transferred to another account. One token can be locked by multiple things at the same time, such as governance and staking.',
    },
    {
      key: 'reserved',
      label: t('table.balances.reserved'),
      value: reservedBalance?.toString() || '0',
      tooltipText:
        'Tokens that are reserved by one specific thing, such as setting an on-chain identity, and cannot be transferred to another account.',
    },
    {
      key: 'free',
      label: t('table.balances.free'),
      value: freeBalance,
      tooltipText:
        'Tokens that are not reserved or locked, and can be transferred to another account.',
    },
  ]
}

const parseBalancesEntities = (
  chainsInfo: MultiChainInfo,
  balancesEntities: BalanceEntityRecord,
  t: TFunction,
  tokenPrices: any[]
) => {
  const balancesInfoByKey: Record<string, any> = {}

  Object.entries(balancesEntities).forEach(([ account, { balances } ]) => {
    balances?.forEach((balance) => {
      const { network, info: balanceInfo } = balance || {}

      const chainInfo = chainsInfo[network] || {}

      const { ss58Format } = chainInfo || {}

      const balanceInfoBySymbol: Record<string, any> = {}

      const allowedTokens = allowedTokensByNetwork[network]

      Object.entries(balanceInfo || {}).forEach(([ symbol, info ]) => {
        if ((allowedTokens && !allowedTokens.includes(symbol)) || !symbol)
          return

        const { decimal } = getDecimalsAndSymbol(chainInfo, symbol)

        if (!decimal) return

        const { accountId: _accountId, totalBalance } = info

        const balance = getBalanceWithDecimals({
          totalBalance: totalBalance ?? '0',
          decimals: decimal,
        })

        balanceInfoBySymbol[symbol] = {
          balance,
          accountData: getAccountData(info, t),
          account:
            _accountId ||
            convertAddressToChainFormat(account, ss58Format) ||
            account,
          price: getPrice(tokenPrices, 'symbol', symbol),
        }
      })

      balancesInfoByKey[`${account}-${network}`] = balanceInfoBySymbol
    })
  })

  return balancesInfoByKey
}

type ParseBalanceTableInfoProps = {
  chainsInfo: MultiChainInfo
  tokenPrices: any
  identities?: AccountIdentitiesRecord
  isMulti?: boolean
  balancesEntities?: BalanceEntityRecord
  isMobile: boolean
  loading: boolean
  onTransferClick: (token: string, network: string) => void
  t: TFunction
}

type ChildrenTokenData = { value: BN; symbol: string; balance: BN }
const createChildrenTokenData = () => {
  let childrenTokenAcrossAccounts: { [key: string]: ChildrenTokenData } = {}
  return {
    addToken: (
      network: string,
      symbol: string,
      tokenData: ChildrenTokenData
    ) => {
      const key = `${network}|${symbol}`
      const token = childrenTokenAcrossAccounts[key]
      if (!token) {
        childrenTokenAcrossAccounts[key] = tokenData
        return
      }
      token.balance = token.balance.plus(tokenData.balance)
      token.value = token.value.plus(tokenData.value)
    },
    getChildrenTokenBalances: () => {
      const tokens = Object.values(childrenTokenAcrossAccounts)
      tokens.sort((a, b) => b.value.minus(a.value).toNumber())
      return tokens.map(
        ({ balance, symbol }) =>
          `${toShortMoney({ num: balance.toNumber() })} ${symbol}`
      )
    },
  }
}

export const parseBalancesTableInfo = ({
  chainsInfo,
  tokenPrices,
  identities,
  isMulti,
  balancesEntities,
  onTransferClick,
  loading,
  t,
}: ParseBalanceTableInfoProps): BalancesTableInfo[] => {
  if (!balancesEntities) return []

  const balancesByKey = parseBalancesEntities(
    chainsInfo,
    balancesEntities,
    t,
    tokenPrices
  )

  const parsedData = [ ...supportedNetworks, ...evmLikeNetworks ].map(
    (supportedNetwork) => {
      const chainInfo = chainsInfo[supportedNetwork]

      if (!chainInfo) return []

      const { tokenSymbols, name, icon, nativeToken, id } = chainInfo || {}

      if (!tokenSymbols) return

      const nativeSymbol = nativeToken || tokenSymbols[0]

      const getOtherTokenSymbols = (tokenBalances: string[]) =>
        nonEmptyArr(tokenBalances) && (
          <MutedSpan
            className={clsx(
              styles.SymbolSize,
              styles.OtherTokens,
              'text-nowrap'
            )}
          >
            {otherBalances(tokenBalances)}
          </MutedSpan>
        )

      const balancesKeysBySupportedNetwork = Object.keys(balancesByKey).filter(
        (x) => x.endsWith(supportedNetwork)
      )
      if (isEmptyArray(balancesKeysBySupportedNetwork)) return

      const {
        addToken: addChildTokenMulti,
        getChildrenTokenBalances: getChildrenTokenBalancesMulti,
      } = createChildrenTokenData()

      const balancesByNetwork: BalancesTableInfo[] =
        balancesKeysBySupportedNetwork
          .map((key) => {
            const balances = balancesByKey[key]

            const balanceBySymbol = balances[nativeSymbol]

            if (!balanceBySymbol) return

            const {
              balance: balanceValue,
              accountData,
              price: priceValue,
              account,
            } = balanceBySymbol

            if (balanceValue.isZero() && isMulti) return

            const subsocialIdentity = getSubsocialIdentityByAccount(
              account,
              identities
            )

            const { totalValue, balance, price } = getBalances({
              balanceValue,
              priceValue,
              symbol: nativeSymbol,
              t,
            })
            let totalTokensValue = totalValue

            const childrenBalances: any = {}
            const { addToken, getChildrenTokenBalances } =
              createChildrenTokenData()

            const children = Object.keys(balances)
              .map((symbol) => {
                if (nativeSymbol === symbol) return

                const infoBySymbol = balances[symbol]

                if (
                  infoBySymbol &&
                  parseFloat(infoBySymbol?.balance?.toString()) > 0
                ) {
                  const { balance: balanceValue, price: priceValue } =
                    infoBySymbol

                  const { total, totalValue, balance, price } = getBalances({
                    balanceValue,
                    priceValue,
                    symbol,
                    t,
                  })

                  const tokenData: ChildrenTokenData = {
                    value: totalValue,
                    symbol,
                    balance: balanceValue,
                  }
                  addToken(id, symbol, tokenData)
                  addChildTokenMulti(id, symbol, tokenData)
                  totalTokensValue = totalTokensValue.plus(totalValue)

                  return {
                    key: `detailed-balances-${symbol}`,
                    balance: <span className='bs-mr-4'>{balance}</span>,
                    price,
                    balanceValue: balanceValue,
                    symbol,
                    total,
                    totalValue,
                    className: styles.Children,
                  }
                }
              })
              ?.filter(isDef)

            const { decimal } = getDecimalsAndSymbol(chainInfo, nativeSymbol)

            const accountDataArray: BalancesTableInfo[] = accountData.map(
              ({ key, label, value, tooltipText }: any) => {
                const valueWithDecimal = getBalanceWithDecimals({
                  totalBalance: value,
                  decimals: decimal,
                })

                const { total, totalValue, balance } = getBalances({
                  balanceValue: valueWithDecimal,
                  priceValue,
                  symbol: nativeSymbol,
                  t,
                })

                const chain = (
                  <div className='w-fit'>
                    <Tooltip
                      title={tooltipText}
                      className='d-flex align-items-center'
                    >
                      <div>{label}</div>
                      <InfoCircleOutlined className='ml-1 GrayIcon' />
                    </Tooltip>
                  </div>
                )

                return {
                  key: `detailed-balances-${key}`,
                  chain: (
                    <div
                      style={{ marginLeft: isMulti ? '5rem' : '3rem' }}
                      className={clsx(
                        { [styles.SecondLevelBalances]: isMulti },
                        'GrayText'
                      )}
                    >
                      {chain}
                    </div>
                  ),
                  balance: <span className='bs-mr-4'>{balance}</span>,
                  balanceValue: valueWithDecimal,
                  price,
                  total,
                  totalValue,
                  className: styles.Children,
                }
              }
            )

            childrenBalances.children = [
              ...accountDataArray.reverse(),
              ...children,
            ]

            const childrenTokenBalances = getChildrenTokenBalances()
            const getBalancePart = (withMargin?: boolean) => (
              <div className={clsx('d-grid', withMargin && 'bs-mr-4')}>
                {balance}
                {getOtherTokenSymbols(childrenTokenBalances)}
              </div>
            )

            const priceView = (
              <div className={styles.RowValue}>
                {price}
                {!isMulti && <PriceChangedOn symbol={nativeSymbol} />}
              </div>
            )

            const totalView = (
              <div className={styles.RowValue}>
                <BalanceView value={totalValue} symbol='$' startWithSymbol />
                {!isMulti && (
                  <PnlInDollars
                    balanceValue={balanceValue}
                    symbol={nativeSymbol}
                  />
                )}
              </div>
            )

            const chain = !isMulti ? (
              <ChainData
                accountId={account}
                isShortAddress={true}
                halfLength={6}
                icon={icon}
                name={name}
                eventSource='balance_table'
              />
            ) : (
              <AccountPreview
                name={name}
                account={account}
                avatar={subsocialIdentity?.image}
                withQr={false}
                eventSource='balance_table'
              />
            )

            const onButtonClick = (e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation()
              e.currentTarget?.blur()
              onTransferClick(nativeSymbol, id)
            }

            const chainValue = (
              <div>
                {isMulti ? (
                  <div style={{ marginLeft: '3rem' }}>{chain}</div>
                ) : (
                  chain
                )}
              </div>
            )

            return {
              key: key,
              chain: chainValue,
              symbol: nativeSymbol,
              balance: getBalancePart(true),
              price: !isMulti ? priceView : <></>,
              total: totalView,
              totalTokensValue,
              icon,
              name,
              chainName: !isMulti ? name : undefined,
              address: account,
              totalValue,
              balanceWithoutChildren: getBalancePart(false),
              balanceValue,
              balanceView: getBalancePart(true),
              links: isMulti ? (
                []
              ) : (
                <LinksButton
                  network={supportedNetwork}
                  action={onButtonClick}
                  showActionButton={false}
                  disableTransferButton={!chainInfo.isTransferable || loading}
                />
              ),
              showLinks: (isShow: boolean) =>
                !isMulti && (
                  <LinksButton
                    action={onButtonClick}
                    network={supportedNetwork}
                    showActionButton={isShow}
                    disableTransferButton={!chainInfo.isTransferable || loading}
                  />
                ),
              transferAction: !isMulti && (
                <Button
                  disabled={!chainInfo.isTransferable || loading}
                  size='small'
                  shape={'circle'}
                  onClick={onButtonClick}
                >
                  <SubIcon Icon={FiSend} className={styles.TransferIcon} />
                </Button>
              ),
              ...childrenBalances,
            }
          })
          .filter(isDef)

      if (isMulti) {
        const { balanceValueBN, totalValueBN, totalTokensValueBN, balance } =
          getParentBalances(balancesByNetwork, nativeSymbol)

        const childrenBalances: any = {}

        if (nonEmptyArr(balancesByNetwork)) {
          childrenBalances.children = balancesByNetwork
        }

        const multiChildrenTokenBalances = getChildrenTokenBalancesMulti()
        const getBalancePart = (withMargin?: boolean) => (
          <div className={clsx('d-grid', withMargin && 'bs-mr-4')}>
            <span>{balance}</span>
            {getOtherTokenSymbols(multiChildrenTokenBalances)}
          </div>
        )

        const tokenPrice = getPrice(tokenPrices || [], 'symbol', nativeSymbol)

        const price = tokenPrice ? (
          <BalanceView value={tokenPrice} symbol='$' startWithSymbol />
        ) : (
          <div className='DfGrey'>{t('general.notListed')}</div>
        )

        const childrenLength = balancesByNetwork.length

        const numberOfAccounts = childrenLength
          ? pluralize({
              count: childrenLength,
              singularText: 'account',
              pluralText: 'accounts',
            })
          : ''

        const chain = (
          <ChainData
            icon={icon}
            name={name}
            accountId={numberOfAccounts}
            isMonosizedFont={false}
            withCopy={false}
          />
        )

        const priceView = (
          <div className={styles.RowValue}>
            {price}
            <PriceChangedOn symbol={nativeSymbol} />
          </div>
        )

        const totalView = (
          <div className={styles.RowValue}>
            <BalanceView value={totalValueBN} symbol='$' startWithSymbol />
            <PnlInDollars balanceValue={balanceValueBN} symbol={nativeSymbol} />
          </div>
        )

        const onButtonClick = (e: React.MouseEvent<HTMLElement>) => {
          e.stopPropagation()
          e.currentTarget?.blur()
          onTransferClick(nativeSymbol, id)
        }

        return [
          {
            key: supportedNetwork,
            chain,
            balance: getBalancePart(true),
            address: numberOfAccounts,
            price: priceView,
            symbol: nativeSymbol,
            total: totalView,
            icon,
            name,
            chainName: name,
            totalTokensValue: totalTokensValueBN,
            totalValue: totalValueBN,
            balanceWithoutChildren: getBalancePart(false),
            balanceValue: balanceValueBN,
            balanceView: getBalancePart(true),
            links: (
              <LinksButton
                network={supportedNetwork}
                action={onButtonClick}
                showActionButton={false}
                disableTransferButton={!chainInfo.isTransferable || loading}
              />
            ),
            showLinks: (isShow: boolean) => (
              <LinksButton
                action={onButtonClick}
                network={supportedNetwork}
                showActionButton={isShow}
                disableTransferButton={!chainInfo.isTransferable || loading}
              />
            ),
            ...childrenBalances,
          },
        ]
      } else {
        return balancesByNetwork
      }
    }
  )

  const balancesInfo = parsedData.filter(isDef).flat()

  const balancesInfoSorted = balancesInfo.sort(
    (a, b) =>
      b.totalValue.minus(a.totalValue).toNumber() ||
      b.balanceValue.minus(a.balanceValue).toNumber() ||
      b.totalTokensValue.minus(a.totalTokensValue).toNumber()
  )

  return balancesInfoSorted
}
