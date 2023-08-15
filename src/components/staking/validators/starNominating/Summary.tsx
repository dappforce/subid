import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import { useNominatingStakingContext, RewardDestinationKey } from '../contexts/NominatingContext'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { usePrices } from '../../../../rtk/features/prices/pricesHooks'
import { useTranslation } from 'react-i18next'
import { useResponsiveSize } from '../../../responsive/ResponsiveContext'
import { BalanceView } from '../../../homePage/address-views/utils/index'
import { getPrice, getTotalBalance, AccountPreview } from '../../../table/utils'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { getRewardDestinations } from '../utils'
import { Space } from 'antd'
import { MutedDiv } from '../../../utils/MutedText'
import clsx from 'clsx'
import { toShortAddress, getTokenSymbol } from '../../../utils/index'
import styles from '../ValidatorStaking.module.sass'

type SummaryProps = {
  network: string
  txFee: React.ReactNode
}

export const Summary = ({ network, txFee }: SummaryProps) => {
  const address = useMyAddress()
  const { bond, selectedValidators, rewardDestination } = useNominatingStakingContext()
  const chainsInfo = useChainInfo()
  const tokenPrices = usePrices()
  const { t, i18n: { language } } = useTranslation()
  const { isMobile } = useResponsiveSize()

  const nativeSymbol = getTokenSymbol(network, chainsInfo)

  const bondValue = <BalanceView value={bond} symbol={nativeSymbol} />

  const tokenPrice = getPrice(tokenPrices || [], 'symbol', nativeSymbol)

  const totalValue = getTotalBalance(new BigNumber(bond), tokenPrice)
  const total = <BalanceView value={tokenPrice ? totalValue : '0'} symbol='$' startWithSymbol />

  const rewardDestinations = useMemo(() => getRewardDestinations(t), [ language ])

  const { title, key } = rewardDestinations.find(x => x.key === Object.keys(rewardDestination)[0]) || {}

  const rewardDestinationValue = key ? rewardDestination[key as RewardDestinationKey] : undefined

  return <Space className='w-100' direction='vertical' size={16}>
    <div className='text-center'>
      <div className={clsx(styles.Bond, 'SemiBold')}>{bondValue}</div>
      <MutedDiv>{total}</MutedDiv>
    </div>
    <Space size={22} direction='vertical' className={clsx(styles.SummaryInfoBlock, 'w-100')}>
      <div className='d-flex justify-content-between align-center'>
        <MutedDiv>
          {t('validatorStaking.startNominatingScreen.summaryBlock.wallet')}
        </MutedDiv>
        <div><AccountPreview account={address || ''} withAddress={false} className={'SemiBold'} /></div>
      </div>
      <div className='d-flex justify-content-between align-center'>
        <MutedDiv>
          {t('validatorStaking.startNominatingScreen.summaryBlock.account')}
        </MutedDiv>
        <div className={'SemiBold'}>{isMobile && address ? toShortAddress(address) : address}</div>
      </div>
      <div className='d-flex justify-content-between align-center'>
        <MutedDiv>
          {t('validatorStaking.startNominatingScreen.summaryBlock.networkFee')}
        </MutedDiv>
        {txFee}
      </div>
    </Space>
    <div className={clsx(styles.SummaryInfoBlock, 'd-flex justify-content-between align-center')}>
      <MutedDiv>
        {t('validatorStaking.startNominatingScreen.summaryBlock.rewardsDestination')}
      </MutedDiv>
      <div 
        className={clsx('d-flex SemiBold text-right', { 
          ['align-items-center']: !isMobile, 
          ['flex-column align-items-end']: isMobile }
        )}
      >
        {title} {rewardDestinationValue 
          && <AccountPreview className={clsx('ml-2 SemiBold text-right', { ['bs-mt-2']: isMobile })} account={rewardDestinationValue} withAddress={false}/>}
      </div>
    </div>
    <div className={clsx(styles.SummaryInfoBlock, 'd-flex justify-content-between align-center')}>
      <MutedDiv>
        {t('validatorStaking.startNominatingScreen.summaryBlock.selectedValidators')}
      </MutedDiv>
      <div className={'SemiBold'}>{selectedValidators.length}</div>
    </div>
  </Space>
}
