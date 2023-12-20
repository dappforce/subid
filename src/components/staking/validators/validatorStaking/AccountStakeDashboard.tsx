import styles from './Index.module.sass'
import { Button, Skeleton, Space } from 'antd'
import { MutedDiv, MutedSpan } from '../../../utils/MutedText'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useMyAddress } from '../../../providers/MyExtensionAccountsContext'
import { convertToBalanceWithDecimal } from '../../../common/balances/utils'
import BN from 'bignumber.js'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { BalanceView } from '../../../homePage/address-views/utils/index'
import StakeMoreModal from './modals/StakeMoreModal'
import { useMemo, useState } from 'react'
import { ModalType } from './modals/StakeMoreModal'
import { PriceView, getTokenDecimals, getTokenSymbol } from '../../../utils/index'
import { toGenericAccountId } from '../../../../rtk/app/util'
import { useBalancesByNetwork, useFetchBalances } from '../../../../rtk/features/balances/balancesHooks'
import { useTranslation } from 'react-i18next'
import { useNominatorInfo } from '../../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'
import { useStakingRewardByAccount, useFetchStakingReward } from '../../../../rtk/features/validators/rewards/rewardsHooks'
import { useResponsiveSize } from '../../../responsive/ResponsiveContext'
import clsx from 'clsx'
import { BIGNUMBER_ZERO } from '../../../../config/app/consts'

type AccountStakingDashboardProps = {
  network: string
}

const AccountStakingDashboard = ({ network }: AccountStakingDashboardProps) => {
  useFetchBalances()
  const myAddress = useMyAddress()
  useFetchStakingReward(network, myAddress)

  const { info } = useNominatorInfo(network, myAddress)
  const { rewards, loading } = useStakingRewardByAccount(network, myAddress) || {}
  const chainsInfo = useChainInfo()
  const [ openModal, setOpenModal ] = useState(false)
  const [ modalType, setModalType ] = useState<ModalType>()
  const { t } = useTranslation()
  const { isMobile } = useResponsiveSize()  

  const decimals = getTokenDecimals(network, chainsInfo)
  const symbol = getTokenSymbol(network, chainsInfo)

  const { stakingLedger } = info || {}

  const activeStakedValue = stakingLedger?.active ? convertToBalanceWithDecimal(stakingLedger.active, decimals) : BIGNUMBER_ZERO
  
  const { currencyBalance: balancesByCurrency } = 
    useBalancesByNetwork({ address: toGenericAccountId(myAddress), network, currency: symbol })

  const activeStakedWithDecimals = new BN(stakingLedger?.active || '0')
  const balanceValue = new BN(balancesByCurrency?.totalBalance || '0')

  const percentOfTokens = activeStakedWithDecimals.isZero() || balanceValue.isZero()
    ? BIGNUMBER_ZERO 
    : activeStakedWithDecimals.dividedBy(balanceValue).multipliedBy(100)

  const totalStaked = <BalanceView value={activeStakedValue} symbol={symbol} />

  const activeInDollars = activeStakedValue ? <PriceView value={activeStakedValue} network={network} /> : <>-</>

  const onOpenModal = (modalType: ModalType) => {
    setModalType(modalType)
    setOpenModal(true)
  }

  const { amount } = rewards || {}
  
  const { reward, rewardInDollars } = useMemo(() => {
    if(loading) return {
      reward: <Skeleton paragraph={{ rows: 0 }} className={styles.RewardSkeleton}/>,
      rewardInDollars: ''
    }

    const rewardValue = amount ? convertToBalanceWithDecimal(amount, decimals) : undefined
    const reward = <BalanceView value={rewardValue?.toFormat().replace(',', '') || '0'} symbol={symbol} fullPostfix />

    const rewardInDollars = rewardValue ? <PriceView value={rewardValue} network={network} /> : ''

    return {
      reward,
      rewardInDollars
    }
  }, [ amount, loading, network, myAddress ])


  return (
    <div className={styles.StakingDashboard}>
      <div className={styles.DashboardImg}><img src={`/images/validators/${network}-dashboard-img.png`} /></div>
      <Space direction='vertical' size={24}>
        <div>
          <MutedDiv className={styles.StakeDashboardTitle}>
            {t('validatorStaking.stakingScreen.accountStakingDashboard.yourStake')}
          </MutedDiv>
          <div className={styles.DashboardValue}>
            {totalStaked} <MutedSpan>
              {t('validatorStaking.stakingScreen.accountStakingDashboard.persentageOfTotalAmount', 
                { percentOfTokens: percentOfTokens.toFixed(2), symbol })}
            </MutedSpan> 
          </div>
          <MutedDiv>{activeInDollars}</MutedDiv>
        </div>
        <div>
          <MutedDiv className={styles.StakeDashboardTitle}>
            {t('validatorStaking.stakingScreen.accountStakingDashboard.yourRewards')}
            </MutedDiv>
          <div className={styles.DashboardValue}>{reward}</div>
          <MutedDiv>{rewardInDollars}</MutedDiv>
        </div>
      </Space>
      <Space direction={isMobile ? 'vertical' : 'horizontal'} size={16} className={clsx('w-100 mt-4', styles.StakeAndUnstakeButtons)}>
        <Button block onClick={() => onOpenModal('unstake')}>
          <MinusCircleOutlined /> {t('validatorStaking.stakingScreen.accountStakingDashboard.unstake')}
          </Button>
        <Button block type='primary' onClick={() => onOpenModal('stake')}>
          <PlusCircleOutlined />  {t('validatorStaking.stakingScreen.accountStakingDashboard.stakeMore')}
        </Button>
      </Space>
     
      <StakeMoreModal network={network} open={openModal} type={modalType} close={() => setOpenModal(false)} />
    </div>
  )
}

export default AccountStakingDashboard
