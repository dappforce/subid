import { BalancesTableInfo } from '../../types'
import { BalanceEntityRecord } from '../../../../rtk/features/balances/balancesSlice'
import { MultiChainInfo } from '../../../../rtk/features/multiChainInfo/types'
import { AccountIdentitiesRecord } from '../../../../rtk/features/identities/identitiesSlice'
import { TFunction } from 'i18next'
import { AccountInfoByChain, BalancesStruct } from 'src/components/identity/types'
import BN from 'bignumber.js'
import {
  AccountPreview,
  AvatarOrSkeleton,
  ChainData,
  getBalances,
  getBalanceWithDecimals,
  getDecimalsAndSymbol,
  getParentBalances,
  getPrice,
  resolveAccountDataImage,
} from '../../utils'
import { BalanceView } from 'src/components/homePage/address-views/utils'
import { convertToBalanceWithDecimal, isDef, isEmptyObj, nonEmptyArr, pluralize, } from '@subsocial/utils'
import BaseAvatar from 'src/components/utils/DfAvatar'
import { MutedDiv } from 'src/components/utils/MutedText'
import clsx from 'clsx'
import styles from '../../Table.module.sass'
import { convertAddressToChainFormat, SubIcon } from 'src/components/utils'
import { LinksButton } from '../../links/Links'
import { Button } from 'antd'
import { FiSend } from 'react-icons/fi'
import tokensCentricImages from 'public/images/folderStructs/token-centric-images.json'
import { getSubsocialIdentityByAccount } from 'src/rtk/features/identities/identitiesHooks'
import { allowedTokensByNetwork, decodeTokenId, encodeTokenId, getBalancePart, } from '../utils'

export type ParseBalanceTableInfoProps = {
  chainsInfo: MultiChainInfo
  tokenPrices: any
  identities?: AccountIdentitiesRecord
  isMulti?: boolean
  balancesEntities?: BalanceEntityRecord
  isMobile: boolean
  loading: boolean
  onTransferClick: (
    token: string,
    network: string,
    tokenId?: { id: any }
  ) => void
  t: TFunction
}

type NonTokenImageProps = {
  tokenId: string
}

const excludedTokensPrefixes = [ 'xc', 'a', 't', '3', 'vs', 'wa' ]

const NonTokenImage = ({ tokenId }: NonTokenImageProps) => {
  const excludedTokenPrefix = excludedTokensPrefixes.find((prefix) =>
    tokenId.startsWith(prefix)
  )
  const firstTokenIdLetter = excludedTokenPrefix
    ? tokenId.replace(excludedTokenPrefix, '')[0]
    : tokenId[0].toLowerCase()

  return <div className={styles.NonTokenImage}>{firstTokenIdLetter}</div>
}

type NetworksIconsProps = {
  networkIcons: string[]
}

export const NetworksIcons = ({ networkIcons }: NetworksIconsProps) => {
  const icons = networkIcons.map((icon, i) => {
    return (
      <AvatarOrSkeleton
        key={i}
        icon={icon}
        size={14}
        style={i !== 0 ? { marginLeft: '-4px' } : {}}
      />
    )
  })
  return <div className={'d-flex alignt-items-center'}>{icons}</div>
}

export const parseTokenCentricView = ({
  chainsInfo,
  tokenPrices,
  identities,
  isMulti,
  balancesEntities,
  isMobile,
  loading,
  onTransferClick,
  t,
}: ParseBalanceTableInfoProps): BalancesTableInfo[] => {
  if (!balancesEntities) return []

  const { balancesByToken, tokenIds } = parseBalancesByToken(
    balancesEntities,
    chainsInfo
  )

  const parsedData = Array.from(tokenIds).map((tokenId, i) => {
    const balancesKeysByTokenId = Object.keys(balancesByToken).filter((x) => {
      const { id: tokenIdPart } = decodeTokenId(x)

      return tokenIdPart === tokenId
    })

    const image = (tokensCentricImages as any)[tokenId.toLowerCase()]

    const imagePath = image ? (
      `tokens-centric/${image}`
    ) : (
      <NonTokenImage tokenId={tokenId} />
    )

    const balancesByKey = balancesKeysByTokenId
      .map((balancesKey, j) => {
        const { address } = decodeTokenId(balancesKey)

        const subsocialIdentity = getSubsocialIdentityByAccount(
          address,
          identities
        )

        const balanceByToken = balancesByToken[balancesKey]

        const { balancesByNetwork, decimals, totalBalance, firstNetwork } =
          balanceByToken

        if (totalBalance.isZero() && isMulti) return

        const priceValue = getPrice(tokenPrices, 'symbol', tokenId)

        const balanceValueWithDecimals = convertToBalanceWithDecimal(
          totalBalance.toFormat().replace(/,/g, ''),
          decimals
        )

        const { totalValue, balance, price } = getBalances({
          balanceValue: balanceValueWithDecimals,
          priceValue,
          symbol: tokenId,
          t,
        })

        const childrenBalances: any = {}

        const { children, networkIcons } = getChildrenBalances({
          balancesByNetwork,
          isMobile,
          isMulti,
          identities,
          priceValue,
          loading,
          tokenId,
          chainsInfo,
          onTransferClick,
          t,
        })

        if (nonEmptyArr(children)) {
          childrenBalances.children = [ ...children ]
        }

        const chainInfo = chainsInfo[firstNetwork]

        const onButtonClick = (e: React.MouseEvent<HTMLElement>) => {
          e.stopPropagation()
          e.currentTarget?.blur()

          const { assetsRegistry, tokenSymbols } = chainInfo
          const asset = assetsRegistry?.[tokenId]

          const currency = asset?.currency

          const isNativeToken = tokenSymbols[0] === tokenId
          const assetRedistyId = !isNativeToken ? currency : undefined

          onTransferClick(tokenId, firstNetwork, { id: assetRedistyId })
        }

        const chain = !isMulti ? (
          <ChainData
            icon={imagePath}
            name={tokenId}
            desc={<NetworksIcons networkIcons={networkIcons} />}
          />
        ) : (
          <AccountPreview
            name={tokenId}
            account={address}
            avatar={subsocialIdentity?.image}
            withQr={false}
          />
        )

        return {
          key: `${balancesKey}-${j}`,
          chain: isMulti ? <div className='ml-5'>{chain}</div> : chain,
          balance: getBalancePart(balance, true),
          price: !isMulti ? price : <></>,
          total: <BalanceView value={totalValue} symbol='$' startWithSymbol />,
          totalTokensValue: totalValue,
          icon: imagePath,
          name: tokenId,
          address: '',
          decimals,
          totalValue: totalValue,
          balanceWithoutChildren: getBalancePart(balance, false),
          balanceValue: totalBalance,
          balanceView: getBalancePart(balance, true),
          links: [],
          networkIcons,
          transferAction: (
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
        } as BalancesTableInfo
      })
      .filter(isDef)

    if (isMulti) {
      const { balanceValueBN, totalValueBN, balance, total } =
        getParentBalances(balancesByKey, tokenId, true)

      const childrenBalances: any = {}

      if (nonEmptyArr(balancesByKey)) {
        childrenBalances.children = balancesByKey
      }

      const tokenPrice = getPrice(tokenPrices || [], 'symbol', tokenId)

      const price = tokenPrice ? (
        <BalanceView value={tokenPrice} symbol='$' startWithSymbol />
      ) : (
        <div className='DfGrey'>{t('general.notListed')}</div>
      )

      const childrenLength = balancesByKey.length

      const numberOfAccounts = childrenLength
        ? pluralize({
            count: childrenLength,
            singularText: 'account',
            pluralText: 'accounts',
          })
        : ''

      const chain = (
        <ChainData
          icon={imagePath}
          name={tokenId}
          accountId={numberOfAccounts}
          isMonosizedFont={false}
          withCopy={false}
        />
      )

      return [
        {
          key: `${tokenId}-${i}`,
          chain,
          balance: getBalancePart(balance, true),
          address: numberOfAccounts,
          price,
          total,
          icon: imagePath,
          name: tokenId,
          totalTokensValue: totalValueBN,
          totalValue: totalValueBN,
          balanceWithoutChildren: getBalancePart(balance, false),
          balanceValue: balanceValueBN,
          balanceView: getBalancePart(balance, true),
          ...childrenBalances,
        },
      ]
    } else {
      return balancesByKey
    }
  })

  const balancesInfo = parsedData.filter(isDef).flat()

  return balancesInfo.sort((a, b) =>
      b.totalTokensValue.minus(a.totalTokensValue).toNumber()
  )
}

type BalanceByToken = {
  totalBalance: BN
  firstNetwork: string
  decimals: number
  balancesByNetwork: Record<string, AccountInfoByChain>
}

type BalancesByTokenId = Record<string, BalanceByToken>

function parseBalancesByToken (
  balancesEntities: BalanceEntityRecord,
  multiChainInfo: MultiChainInfo
) {
  const balancesByToken: BalancesByTokenId = {}
  const tokenIds = new Set<string>()

  Object.entries(balancesEntities).forEach(([ address, balancesEntity ]) => {
    balancesEntity.balances?.forEach(({ network, info }) => {
      if (!info || isEmptyObj(info)) return

      const chainInfo = multiChainInfo[network]
      const allowedTokens = allowedTokensByNetwork[network]

      const { ss58Format } = chainInfo

      Object.entries(info).forEach(([ tokenId, balances ]) => {
        const encodedTokenId = encodeTokenId(address, tokenId)

        if ((allowedTokens && !allowedTokens.includes(tokenId)) || !tokenId)
          return

        const {
          balancesByNetwork,
          firstNetwork,
          totalBalance: totalBalanceSum,
        } = balancesByToken[encodedTokenId] || {}

        const { totalBalance: newTotalBalance } = balances
        const { decimal } = getDecimalsAndSymbol(chainInfo, tokenId)

        if(!decimal) return

        const totalBalanceValue = (totalBalanceSum || new BN('0')).plus(
          newTotalBalance || '0'
        )

        tokenIds.add(tokenId)

        balancesByToken[encodedTokenId] = {
          totalBalance: totalBalanceValue,
          decimals: decimal,
          firstNetwork: firstNetwork || network,
          balancesByNetwork: {
            ...(balancesByNetwork || {}),
            [network]: {
              ...balances,
              accountId: convertAddressToChainFormat(address, ss58Format),
            } as AccountInfoByChain,
          },
        }
      })
    })
  })

  return { balancesByToken, tokenIds }
}

type GetChildrenBalanceParams = {
  balancesByNetwork: Record<string, AccountInfoByChain>
  isMulti?: boolean
  isMobile: boolean
  chainsInfo: MultiChainInfo
  tokenId: string
  priceValue: string
  loading: boolean
  identities?: AccountIdentitiesRecord
  onTransferClick: (
    token: string,
    network: string,
    tokenId: { id: any }
  ) => void
  t: TFunction
}

function getChildrenBalances ({
  balancesByNetwork,
  isMulti,
  chainsInfo,
  tokenId,
  priceValue,
  loading,
  onTransferClick,
  t,
}: GetChildrenBalanceParams) {
  const balancesByNetworkEntries = Object.entries(balancesByNetwork)
  const networkIcons: string[] = []

  const result = balancesByNetworkEntries.map(([ network, balances ]) => {
    const { totalBalance, accountId, ...otherBalances } = balances

    const chainInfo = chainsInfo[network]

    const { icon, name } = chainInfo

    const { decimal } = getDecimalsAndSymbol(chainInfo, tokenId)

    if(!decimal) return

    const balanceValue = getBalanceWithDecimals({
      totalBalance: totalBalance ?? '0',
      decimals: decimal,
    })

    if (balanceValue.isZero()) return

    const { totalValue, balance } = getBalances({
      balanceValue,
      priceValue,
      symbol: tokenId,
      t,
    })

    const childrenBalances: any = {}

    const accountData = getAccountDataRows({
      ...otherBalances,
      t,
      price: <></>,
      priceValue,
      isMulti,
      tokenId,
      decimal,
    })

    childrenBalances.children = [ ...accountData.reverse() ]

    const chain = <ChainData 
      icon={icon} 
      name={name} 
      avatarSize={'small'} 
      isBoldName={false} 
    />

    const onButtonClick = (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      e.currentTarget?.blur()

      const { assetsRegistry, tokenSymbols } = chainInfo
      const asset = assetsRegistry?.[tokenId]

      const currency = asset?.currency

      const isNativeToken = tokenSymbols[0] === tokenId
      const assetRedistyId = !isNativeToken ? currency : undefined

      onTransferClick(tokenId, network, { id: assetRedistyId })
    }

    networkIcons.push(icon)

    return {
      key: network,
      chain: <div className='ml-5'>{chain}</div>,
      balance: getBalancePart(balance, true),
      price: <></>,
      total: <BalanceView value={totalValue} symbol='$' startWithSymbol />,
      totalTokensValue: totalValue,
      icon,
      name: network,
      address: accountId,
      totalValue: totalValue,
      balanceWithoutChildren: getBalancePart(balance, false),
      balanceValue: balanceValue,
      balanceView: getBalancePart(balance, true),
      links: (
        <LinksButton
          network={network}
          action={onButtonClick}
          showActionButton={false}
          disableTransferButton={!chainInfo.isTransferable || loading}
        />
      ),
      showLinks: (isShow: boolean) => (
        <LinksButton
          action={onButtonClick}
          network={network}
          showActionButton={isShow}
          disableTransferButton={!chainInfo.isTransferable || loading}
        />
      ),
      transferAction: (
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
    } as BalancesTableInfo
  })

  return { children: result.filter(isDef), networkIcons }
}

type GetAccountDataValuesParams = BalancesStruct & {
  t: TFunction
}

function getAccountDataValues ({ t, ...info }: GetAccountDataValuesParams) {
  const { reservedBalance, freeBalance, lockedBalance } = info

  return [
    // {
    //   key: 'frozen',
    //   label: t('table.balances.frozen'),
    //   value: frozenBalance?.toString() || '0',
    // },
    {
      key: 'locked',
      label: t('table.balances.locked'),
      value: lockedBalance?.toString() || '0',
    },
    {
      key: 'reserved',
      label: t('table.balances.reserved'),
      value: reservedBalance?.toString() || '0',
    },
    {
      key: 'free',
      label: t('table.balances.free'),
      value: freeBalance,
    },
  ]
}

type GetAccountDataRowsParams = GetAccountDataValuesParams & {
  decimal: number
  priceValue: string
  price: JSX.Element
  tokenId: string
  isMulti?: boolean
}

function getAccountDataRows ({
  decimal,
  price,
  priceValue,
  tokenId,
  isMulti,
  t,
  ...accountDataValuesParams
}: GetAccountDataRowsParams) {
  const accountDataValues = getAccountDataValues({
    t,
    ...accountDataValuesParams,
  })

  return accountDataValues.map(
      ({ key, label, value }: any) => {
        const valueWithDecimal = getBalanceWithDecimals({
          totalBalance: value,
          decimals: decimal,
        })

        const { total, totalValue, balance } = getBalances({
          balanceValue: valueWithDecimal,
          priceValue,
          symbol: tokenId,
          t,
        })

        const chain = (
            <div className='d-flex align-items-center'>
              <BaseAvatar size={24} avatar={resolveAccountDataImage(key)}/>
              <div>{label}</div>
            </div>
        )

        return {
          key,
          chain: (
              <MutedDiv
                  className={clsx({ [styles.SecondLevelBalances]: isMulti }, 'ml-5')}
              >
                {chain}
              </MutedDiv>
          ),
          balance: <span className='bs-mr-4'>{balance}</span>,
          price,
          total,
          totalValue,
          className: styles.Children,
        }
      }
  )
}
