import clsx from 'clsx'

export const allowedTokensByNetwork: Record<string, string[]> = {
  statemine: [
    'BTC',
    'CHAOS',
    'USDC',
    'USDT',
    'DOT',
    'CHRWNA',
    'RMRK',
    'KSM',
    'BILL',
    'KODA',
    'SHIB',
  ],
  parallel: [
    'LDOT',
    'INTR',
    'ACA',
    'DOT',
    'IBTC',
    'AUSD',
    'USDT',
    'lcDOT',
    'GLMR',
    'CLV',
    'ASTR',
    'PHA',
    'PARA',
  ],
  statemint: [ 'WETH', 'WBTC', 'BTC', 'DOT', 'USDC', 'BUSD' ],
}

export const getBalancePart = (balance: JSX.Element, withMargin?: boolean) => (
  <div className={clsx('d-grid', withMargin && 'mr-4')}>{balance}</div>
)

export const encodeTokenId = (address: string, tokenId: string) => `${address}-and-${tokenId}`

export const decodeTokenId = (tokenId: string) => {
  const [ address, id ] = tokenId.split('-and-')
  return { address, id }
}