import { sendGetRequest } from './utils'

export const getAssets = async () => ( 
  sendGetRequest({
    params: { url: 'statemine/assets' },
    onFailReturnedValue: [],
    onFailedText: 'Failed to get assets'
  })
)

export const getAssetsBalancesByAccount = async (account: string) => (
  sendGetRequest({
    params: { url: `statemine/assets/${account}` },
    onFailReturnedValue: undefined,
    onFailedText: 'Failed to get assets balances by account'
  })
)