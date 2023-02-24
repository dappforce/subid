import BN from 'bignumber.js'
import React from 'react'
import { nonEmptyArr, isDef, isEmptyArray, pluralize, toShortMoney } from '@subsocial/utils'
import { MutedSpan, MutedDiv } from '../../utils/MutedText'
import {
  ChainData,
  getBalanceWithDecimals,
  otherBalances,
  getDecimalsAndSymbol,
  getPrice,
  getBalances,
  AccountPreview,
  getParentBalances,
  resolveAccountDataImage
} from '../utils'
import styles from '../Table.module.sass'
import { BalancesTableInfo } from '../types'
import clsx from 'clsx'
import { BalanceEntityRecord } from '../../../rtk/features/balances/balancesSlice'
import { MultiChainInfo, supportedNetworks, evmLikeNetworks } from '../../../rtk/features/multiChainInfo/types'
import { convertAddressToChainFormat, SubIcon } from '../../utils/index'
import { AccountIdentitiesRecord } from '../../../rtk/features/identities/identitiesSlice'
import { AccountInfoByChain } from '../../identity/types'
import { getSubsocialIdentityByAccount } from '../../../rtk/features/identities/identitiesHooks'
import BaseAvatar from '../../utils/DfAvatar'
import { BalanceView } from '../../homePage/address-views/utils/index'
import { TFunction } from 'i18next'
import { Button } from 'antd'
import { FiSend } from 'react-icons/fi' 
import { LinksButton } from './Links'

const getAccountData = (info: AccountInfoByChain, t: TFunction) => {
  const { reservedBalance, frozenFee, freeBalance, frozenMisc } = info

  const transferableBalance = new BN(freeBalance || 0).minus(new BN(frozenMisc || frozenFee || 0)).toString()

  return [
    { key: 'frozen', label: t('table.balances.frozen'), value: frozenFee?.toString() || '0' },
    { key: 'locked', label: t('table.balances.locked'), value: frozenMisc?.toString() || '0' },
    { key: 'reserved', label: t('table.balances.reserved'), value: reservedBalance?.toString() || '0' },
    { key: 'free', label: t('table.balances.free'), value: transferableBalance }
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
    balances?.forEach(balance => {
      const { network, info: balanceInfo } = balance

      const chainInfo = chainsInfo[network]

      const { ss58Format } = chainInfo

      const balanceInfoBySymbol: Record<string, any> = {}

      Object.entries(balanceInfo).forEach(([ symbol, info ]) => {
        const { decimal } = getDecimalsAndSymbol(chainInfo, symbol)

        if (!decimal) return

        const { accountId: _accountId, totalBalance } = info

        const balance = getBalanceWithDecimals({ totalBalance: totalBalance ?? '0', decimals: decimal })

        balanceInfoBySymbol[symbol] = {
          balance,
          accountData: getAccountData(info, t),
          account: _accountId || convertAddressToChainFormat(account, ss58Format) || account,
          price: getPrice(tokenPrices, 'symbol', symbol)
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
  onTransferClick: (token: string, network: string) => void
  t: TFunction
}

type ChildrenTokenData = { value: BN; symbol: string; balance: BN }
const createChildrenTokenData = () => {
  let childrenTokenAcrossAccounts: { [key: string]: ChildrenTokenData } = {}
  return {
    addToken: (network: string, symbol: string, tokenData: ChildrenTokenData) => {
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
      return tokens.map(({ balance, symbol }) => `${toShortMoney({ num: balance.toNumber() })} ${symbol}`)
    }
  }
}

export const parseBalancesTableInfo = ({
  chainsInfo,
  tokenPrices,
  identities,
  isMulti,
  balancesEntities,
  isMobile,
  onTransferClick,
  t
}: ParseBalanceTableInfoProps): BalancesTableInfo[] => {
  if (!balancesEntities) return []

  const balancesByKey = parseBalancesEntities(chainsInfo, balancesEntities, t, tokenPrices)

  const parsedData = [ ...supportedNetworks, ...evmLikeNetworks ].map(supportedNetwork => {
    const chainInfo = chainsInfo[supportedNetwork]

    if (!chainInfo) return []

    const { tokenSymbols, name, icon, nativeToken, id } = chainInfo

    if (!tokenSymbols) return

    const nativeSymbol = nativeToken || tokenSymbols[0]

    const getOtherTokenSymbols = (tokenBalances: string[]) => (
      nonEmptyArr(tokenBalances) && (
        <MutedSpan className={`${styles.SymbolSize} ${styles.OtherTokens} text-nowrap`}>
          {otherBalances(tokenBalances)}
        </MutedSpan>
      )
    )

    const balancesKeysBySupportedNetwork = Object.keys(balancesByKey).filter(x => x.endsWith(supportedNetwork))
    if (isEmptyArray(balancesKeysBySupportedNetwork)) return

    const { 
      addToken: addChildTokenMulti, 
      getChildrenTokenBalances: getChildrenTokenBalancesMulti 
    } = createChildrenTokenData()

    const balancesByNetwork: BalancesTableInfo[] = balancesKeysBySupportedNetwork.map((key) => {
      const balances = balancesByKey[key]

      const balanceBySymbol = balances[nativeSymbol]

      if (!balanceBySymbol) return

      const { balance: balanceValue, accountData, price: priceValue, account } = balanceBySymbol

      if (balanceValue.isZero() && isMulti) return

      const subsocialIdentity = getSubsocialIdentityByAccount(account, identities)

      const { totalValue, balance, price } = getBalances({ balanceValue, priceValue, symbol: nativeSymbol, t })
      let totalTokensValue = totalValue

      const childrenBalances: any = {}
      const { addToken, getChildrenTokenBalances } = createChildrenTokenData()

      const children = Object.keys(balances).map((symbol) => {
        if (nativeSymbol === symbol) return

        const infoBySymbol = balances[symbol]

        if (infoBySymbol && parseFloat(infoBySymbol?.balance?.toString()) > 0) {
          const { balance: balanceValue, price: priceValue } = infoBySymbol

          const { total, totalValue, balance, price } = getBalances({ balanceValue, priceValue, symbol, t })

          const tokenData: ChildrenTokenData = {
            value: totalValue,
            symbol,
            balance: balanceValue
          }
          addToken(id, symbol, tokenData)
          addChildTokenMulti(id, symbol, tokenData)
          totalTokensValue = totalTokensValue.plus(totalValue)

          return {
            key: symbol,
            chain: <></>,
            balance: <span className='mr-4'>{balance}</span>,
            price,
            total,
            totalValue,
            className: styles.Children
          }
        }
      })?.filter(isDef)

      const { decimal } = getDecimalsAndSymbol(chainInfo, nativeSymbol)

      const accountDataArray: BalancesTableInfo[] = accountData.map(({ key, label, value }: any) => {
        const valueWithDecimal = getBalanceWithDecimals({ totalBalance: value, decimals: decimal })

        const { total, totalValue, balance } = 
          getBalances({ balanceValue: valueWithDecimal, priceValue, symbol: nativeSymbol, t })

        const chain = <div className='d-flex align-items-center'>
          <BaseAvatar size={24} avatar={resolveAccountDataImage(key)} />
          <div>{label}</div>
        </div>

        return {
          key,
          chain: <MutedDiv className={clsx({ [styles.SecondLevelBalances]: isMulti }, 'ml-5')}>{chain}</MutedDiv>,
          balance: <span className='mr-4'>{balance}</span>,
          price,
          total,
          totalValue,
          className: styles.Children
        }
      })

      childrenBalances.children = [ ...accountDataArray.reverse(), ...children ]

      const childrenTokenBalances = getChildrenTokenBalances()
      const getBalancePart = (withMargin?: boolean) => (
        <div className={clsx('d-grid', withMargin && 'mr-4')}>
          {balance}
          {getOtherTokenSymbols(childrenTokenBalances)}
        </div>
      )

      const chain = !isMulti
        ? <ChainData accountId={account} isShortAddress={true} halfLength={6} icon={icon} name={name} />
        : <AccountPreview
          name={name}
          account={account}
          avatar={subsocialIdentity?.image}
          withQr={!isMobile}
        />

      const onButtonClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        e.currentTarget?.blur()
        onTransferClick(nativeSymbol, id)
      }

      return {
        key: key,
        chain: isMulti ? <div className='ml-5'>{chain}</div> : chain,
        balance: getBalancePart(true),
        price,
        total: <BalanceView value={totalTokensValue} symbol='$' startWithSymbol />,
        totalTokensValue,
        icon,
        name,
        address: account,
        totalValue,
        balanceWithoutChildren: getBalancePart(false),
        balanceValue,
        balanceView: getBalancePart(true),
        links: <LinksButton network={supportedNetwork} action={isMobile ? onButtonClick : undefined}/>,
        transferAction: (
          <Button
            disabled={!chainInfo.isTransferable}
            size='small'
            shape={'circle'}
            onClick={onButtonClick}>
            <SubIcon Icon={FiSend} className={styles.TransferIcon}/>
          </Button>
        ),
        ...childrenBalances
      }
    }).filter(isDef)

    if (isMulti) {
      const {
        balanceValueBN,
        totalValueBN,
        balance,
        total
      } = getParentBalances(balancesByNetwork, nativeSymbol)

      const childrenBalances: any = {}

      if (nonEmptyArr(balancesByNetwork)) {
        childrenBalances.children = balancesByNetwork
      }

      const multiChildrenTokenBalances = getChildrenTokenBalancesMulti()
      const getBalancePart = (withMargin?: boolean) => <div className={clsx('d-grid', withMargin && 'mr-4')}>
        <span>{balance}</span>
        {getOtherTokenSymbols(multiChildrenTokenBalances)}
      </div>

      const tokenPrice = getPrice(tokenPrices || [], 'symbol', nativeSymbol)

      const price = tokenPrice
        ? <BalanceView value={tokenPrice} symbol='$' startWithSymbol />
        : <div className='DfGrey'>{t('general.notListed')}</div>

      const childrenLength = balancesByNetwork.length

      const numberOfAccounts = childrenLength 
        ? pluralize({ count: childrenLength, singularText: 'account', pluralText: 'accounts' }) 
        : ''

      const chain = <ChainData
        icon={icon}
        name={name}
        accountId={numberOfAccounts}
        isMonosizedFont={false}
        withCopy={false}
      />

      return [ {
        key: supportedNetwork,
        chain,
        balance: getBalancePart(true),
        address: numberOfAccounts,
        price,
        total,
        icon,
        name,
        totalTokensValue: totalValueBN,
        totalValue: totalValueBN,
        balanceWithoutChildren: getBalancePart(false),
        balanceValue: balanceValueBN,
        balanceView: getBalancePart(true),
        ...childrenBalances
      } ]
    } else {
      return balancesByNetwork
    }
  })

  const balancesInfo = parsedData.filter(isDef).flat()

  const balancesInfoSorted = balancesInfo.sort((a, b) => (
    b.totalTokensValue.minus(a.totalTokensValue).toNumber()
  ))

  return balancesInfoSorted
}