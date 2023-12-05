import { Storage } from '@acala-network/sdk/utils/storage'
import { AnyApi, FixedPointNumber as FN } from '@acala-network/sdk-core'
import { combineLatest, map, Observable } from 'rxjs'

import { SubmittableExtrinsic } from '@polkadot/api/types'
import { DeriveBalancesAll } from '@polkadot/api-derive/balances/types'
import { ISubmittableResult } from '@polkadot/types/types'
import { createRouteConfigs, validateAddress } from '@polkawallet/bridge/utils'
import {
  BalanceData,
  ChainId,
  chains,
  ExtendedToken,
  TransferParams,
} from '@polkawallet/bridge'
import {
  BalanceAdapter,
  BalanceAdapterConfigs,
} from '@polkawallet/bridge/balance-adapter'
import {
  ApiNotFound,
  InvalidAddress,
  TokenNotFound,
} from '@polkawallet/bridge/errors'
import { BaseCrossChainAdapter } from '@polkawallet/bridge/base-chain-adapter'
import { getDestAccountInfo } from './utils/destination-utils'

export const moonbeamRouteConfigs = createRouteConfigs('moonbeam', [
  {
    to: 'subsocial' as any,
    token: 'xcSUB',
    xcm: {
      fee: { token: 'SUB', amount: '1000000000' },
    },
  },
])

const moonbeamTokensConfig: Record<string, ExtendedToken> = {
  SUB: {
    name: 'SUB',
    symbol: 'SUB',
    decimals: 10,
    ed: '100000000000',
    toRaw: () => ({
      ForeignAsset: '89994634370519791027168048838578580624',
    }),
  },
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createBalanceStorages = (api: AnyApi) => {
  return {
    balances: (address: string) =>
      Storage.create<DeriveBalancesAll>({
        api,
        path: 'derive.balances.all',
        params: [ address ],
      }),
  }
}

class MoonbeamBalanceAdapter extends BalanceAdapter {
  private storages: ReturnType<typeof createBalanceStorages>

  constructor ({ api, chain, tokens }: BalanceAdapterConfigs) {
    super({ api, chain, tokens })
    this.storages = createBalanceStorages(api)
  }

  public subscribeBalance (
    token: string,
    address: string
  ): Observable<BalanceData> {
    const storage = this.storages.balances(address)

    if (token !== this.nativeToken) {
      throw new TokenNotFound(token)
    }

    return storage.observable.pipe(
      map((data) => ({
        free: FN.fromInner(data.freeBalance.toString(), this.decimals),
        locked: FN.fromInner(data.lockedBalance.toString(), this.decimals),
        reserved: FN.fromInner(data.reservedBalance.toString(), this.decimals),
        available: FN.fromInner(
          data.availableBalance.toString(),
          this.decimals
        ),
      }))
    )
  }
}

class MoonbeamBaseAdapter extends BaseCrossChainAdapter {
  private balanceAdapter?: MoonbeamBalanceAdapter

  public async init (api: AnyApi) {
    this.api = api

    await api.isReady

    const chain = this.chain.id as ChainId

    this.balanceAdapter = new MoonbeamBalanceAdapter({
      chain,
      api,
      tokens: moonbeamTokensConfig,
    })
  }

  public subscribeTokenBalance (
    token: string,
    address: string
  ): Observable<BalanceData> {
    if (!this.balanceAdapter) {
      throw new ApiNotFound(this.chain.id)
    }

    return this.balanceAdapter.subscribeBalance(token, address)
  }

  public subscribeMaxInput (
    token: string,
    address: string,
    to: ChainId
  ): Observable<FN> {
    if (!this.balanceAdapter) {
      throw new ApiNotFound(this.chain.id)
    }

    return combineLatest({
      txFee: this.estimateTxFee({
        amount: FN.ZERO,
        to,
        token,
        address,
        signer: address,
      }),
      balance: this.balanceAdapter
        .subscribeBalance(token, address)
        .pipe(map((i) => i.available)),
    }).pipe(
      map(({ balance, txFee }) => {
        const tokenMeta = this.balanceAdapter?.getToken(token)
        const feeFactor = 1.2
        const fee = FN.fromInner(txFee, tokenMeta?.decimals).mul(
          new FN(feeFactor)
        )

        // always minus ed
        return balance
          .minus(fee)
          .minus(FN.fromInner(tokenMeta?.ed || '0', tokenMeta?.decimals))
      })
    )
  }

  public createTx (
    params: TransferParams
  ):
    | SubmittableExtrinsic<'promise', ISubmittableResult>
    | SubmittableExtrinsic<'rxjs', ISubmittableResult> {
    if (this.api === undefined) {
      throw new ApiNotFound(this.chain.id)
    }

    const { address, amount, to, token } = params

    const { accountId, accountType, addrType } = getDestAccountInfo(
      address,
      token,
      this.api,
      to
    )

    const tokenData = moonbeamTokensConfig[token.replace('xc', '')]

    if (!validateAddress(address, addrType)) throw new InvalidAddress(address)

    const toChain = chains[to]

    return this.api.tx.xTokens.transfer(
      tokenData.toRaw(),
      amount.toChainData(),
      {
        V3: {
          parents: 1,
          interior: {
            X2: [
              { Parachain: toChain.paraChainId },
              { [accountType]: { id: accountId, network: undefined } },
            ],
          },
        },
      } as any,
      'Unlimited'
    )
  }
}

export class MoonbeamAdapter extends MoonbeamBaseAdapter {
  constructor () {
    super(chains.moonbeam, moonbeamRouteConfigs, moonbeamTokensConfig)
  }
}
