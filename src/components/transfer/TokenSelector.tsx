import { Avatar, AvatarProps } from 'antd'
import clsx from 'clsx'
import React, { HTMLProps, useMemo } from 'react'
import { isEthereumAddress } from '@polkadot/util-crypto'
import { useChainInfo } from 'src/rtk/features/multiChainInfo/multiChainInfoHooks'
import { MutedSpan } from '../utils/MutedText'
import SearchableSelect, {
  SearchableSelectOption, SearchableSelectProps,
} from '../utils/SearchableSelect'
import DualAvatar from '../utils/DualAvatar'
import { isTokenBridgeable } from './configs/cross-chain'
import tokenImages from './tokenImages'
import styles from './TokenSelector.module.sass'
import { useMyAddress } from '../providers/MyExtensionAccountsContext'

export type TokenSelectorProps = HTMLProps<HTMLDivElement> & {
  value?: string
  setValue: (token: string) => void
  showNetwork?: boolean
  filterCrossChainBridgeable?: boolean
  selectProps?: Omit<SearchableSelectProps, 'options'>
}

export type TokenData = {
  tokenId?: { id: any }
  token: string
  network?: string
}

export const tokenSelectorEncoder = {
  encode: ({ network, token, tokenId }: TokenData) => {
    const id = tokenId?.id ? JSON.stringify(tokenId) : ''
    return `${id}|${token}|${network ?? ''}`
  },
  decode: (encoded: string): TokenData => {
    if (!encoded) return { token: '' }
    const [ id, token, network ] = encoded.split('|')
    let parsedId: TokenData['tokenId']
    if (id) {
      try {
        parsedId = JSON.parse(id)
      } catch {}
    }
    return { token, network, tokenId: parsedId }
  },
}

const generateAddTokenOption =
  (
    showNetwork: boolean,
    networkId: string,
    networkName: string,
    icon: string,
    tokenMap: Record<string, SearchableSelectOption>,
    filterCrossChainBridgeable?: boolean
  ) =>
  (tokenName: string, tokenId?: TokenData['tokenId']) => {
    const network = showNetwork ? networkName : ''
    const tokenData: TokenData = {
      tokenId: showNetwork ? tokenId : undefined,
      token: tokenName,
      network: showNetwork ? networkId : '',
    }
    const encodedTokenData = tokenSelectorEncoder.encode(tokenData)
    if (tokenMap[encodedTokenData]) return
    if (filterCrossChainBridgeable && !isTokenBridgeable(tokenName)) return

    const filterNetwork = showNetwork ? networkName : ''
    tokenMap[encodedTokenData] = {
      value: encodedTokenData,
      label: (
        <TokenOption
          networkImage={showNetwork ? `/images/${icon}` : undefined}
          token={tokenName}
          network={network}
        />
      ),
      // to make user can search with many ways
      filterData: `${tokenName} ${filterNetwork} ${tokenName}${filterNetwork}${tokenName}`,
    }
  }

export default function TokenSelector ({
  value,
  setValue,
  showNetwork,
  filterCrossChainBridgeable,
  selectProps,
  ...props
}: TokenSelectorProps) {
  const chainInfo = useChainInfo()
  const myAddress = useMyAddress()

  const options = useMemo(() => {
    const tokenMap: Record<string, SearchableSelectOption> = {}

    Object.values(chainInfo).forEach(
      ({
        icon,
        nativeToken,
        tokenSymbols,
        id: networkId,
        name,
        assetsRegistry,
        isTransferable,
        tokenTransferMethod,
        isEthLike
      }) => {
        const isEthAddress = isEthereumAddress(myAddress)
        if (isEthAddress && !isEthLike) return
        if (!isEthAddress && isEthLike) return

        const addTokenOption = generateAddTokenOption(
          !!showNetwork,
          networkId,
          name,
          icon,
          tokenMap,
          filterCrossChainBridgeable,
        )
        const nativeTokenSymbol = nativeToken || tokenSymbols?.[0]
        if (!nativeTokenSymbol || !isTransferable) return

        addTokenOption(nativeTokenSymbol)
        if (!assetsRegistry || !tokenTransferMethod) return

        Object.values(assetsRegistry).forEach((asset) => {
          const tokenSymbol = asset.symbol
          if (tokenSymbol === nativeTokenSymbol) return
          const currency = asset.currency
          if (!currency) return
          const tokenId = currency
          addTokenOption(tokenSymbol, { id: tokenId })
        })
      }
    )
    return Object.values(tokenMap)
  }, [ chainInfo, showNetwork, myAddress ])

  return (
    <div
      {...props}
      className={clsx(styles.TokenSelector, props.className)}
      style={{ marginLeft: '-11px', ...props.style }}>
      <SearchableSelect
        defaultActiveFirstOption
        bordered={false}
        {...selectProps}
        style={{ minWidth: showNetwork ? '200px' : '100px', ...selectProps?.style }}
        options={options}
        onChange={(value) => setValue(value)}
        value={value}
      />
    </div>
  )
}

function TokenOption ({
  token,
  networkImage,
  network,
}: {
  token: string
  networkImage?: string
  network?: string
}) {
  const avatarProps: AvatarProps = {
    className: 'border d-block',
    style: { width: '2em', height: '2em', background: 'white' }
  }
  const imagePath: string | undefined = tokenImages[token.toUpperCase() as keyof typeof tokenImages]
  let image = '/images/tokens/unknown.png'
  if (imagePath) {
    image = `/images/${imagePath}`
  }
  const tokenImage = (
    <Avatar
      {...avatarProps}
      className={styles.TokenLogo}
      src={image}
    />
  )

  return (
    <div className='d-flex align-items-center'>
      {networkImage ? (
        <DualAvatar
          style={{ flexShrink: '0' }}
          leftAvatar={tokenImage}
          rightAvatar={<Avatar {...avatarProps} className={styles.TokenLogo} src={networkImage} />}
          rightAvatarSize={28}
        />
      ) : (
        <div className='mr-2'>
          {tokenImage}
        </div>
      )}
      <span className='font-weight-semibold'>{token}</span>
      {network && <MutedSpan className='ml-2'>{network}</MutedSpan>}
    </div>
  )
}
