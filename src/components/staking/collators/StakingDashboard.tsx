import { Row, Col, Divider, Skeleton } from 'antd'
import styles from './Staking.module.sass'
import { useEffect, useState } from 'react'
import { NextRoundStartDate } from './utils'
import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { BN_ZERO } from '@polkadot/util'
import { FAQModalButton } from './FAQModal'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import { MutedSpan } from '../../utils/MutedText'
import {
  useMyAddresses,
  useMyAddress,
} from '../../providers/MyExtensionAccountsContext'
import { useChainInfo } from '../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useStakingDelegatorsStateByNetwork } from '../../../rtk/features/stakingDelegators/stakingDelegatorHooks'
import {
  isDataLoading,
  getBalanceWithDecimals,
} from '../../table/utils'
import { useBalancesByNetwork } from '../../../rtk/features/balances/balancesHooks'
import { toGenericAccountId } from '../../../rtk/app/util'
import { convertToBalanceWithDecimal } from '../../common/balances/utils'
import { useStakingCandidatesListByNetwork } from '../../../rtk/features/stakingCandidates/stakingCandidatesHooks'
import { BalanceView } from '../../homePage/address-views/utils/index'
import { getTransferableBalance } from '../../../utils/balance'
import { PageTitle, getTokenDecimals, getTokenSymbol } from '../../utils/index'
import { BIGNUMBER_ZERO } from '../../../config/app/consts'

type DashboardItemProps = {
  title: string
  desc: React.ReactNode
  withDivider?: boolean
  withMargin?: boolean
}

const DashboardItem = ({
  title,
  desc,
  withDivider = true,
  withMargin = false,
}: DashboardItemProps) => {
  const { isMobile } = useResponsiveSize()

  return (
    <>
      <div className='d-flex justify-content-between FontNormal'>
        <div className={styles.DashboardItem}>
          <MutedSpan
            className={clsx(styles.FontSmall, { ['bs-mt-2']: !withMargin && isMobile })}
          >
            {title}
          </MutedSpan>

          <span className={clsx(styles.FontLarge, { ['bs-mb-2']: withMargin })}>
            {desc}
          </span>
        </div>
        {withDivider && <Divider type='vertical' className='h-auto m-0' />}
      </div>
      {withMargin && <Divider type='horizontal' className='m-0' />}
    </>
  )
}

const getAmountsSum = (amounts: string[]) => 
  amounts.reduce((prevValue, currentValue) => new BN(prevValue).plus(new BN(currentValue)).toString())

type StakingDashboardProps = {
  network: string
}

const StakingDashboard = ({ network }: StakingDashboardProps) => {
  const myAddresses = useMyAddresses()
  const myAddress = useMyAddress()
  const { isMobile } = useResponsiveSize()
  const [ loading, setLoading ] = useState<boolean>(false)
  const [ myStake, setMyStake ] = useState('0')
  const chainsInfo = useChainInfo()
  const { t } = useTranslation()

  const stakingDelegatorStateEntities = useStakingDelegatorsStateByNetwork(
    network,
    myAddresses
  )

  const stakingDelegatorStateLoading = isDataLoading(
    stakingDelegatorStateEntities
  )
  const chainInfo = chainsInfo[network]

  const { name: chainName } = chainInfo || {}

  const decimal = getTokenDecimals(network, chainsInfo)
  const nativeSymbol = getTokenSymbol(network, chainsInfo)

  const balancesByCurrency = useBalancesByNetwork({
    address: toGenericAccountId(myAddress),
    network,
    currency: nativeSymbol,
  })
  const availableBalance = balancesByCurrency
    ? getTransferableBalance(balancesByCurrency)
    : BN_ZERO
  const transferableBalance = decimal
    ? convertToBalanceWithDecimal(availableBalance.toString(), decimal)
    : BIGNUMBER_ZERO

  const stakingCandidatesByNetwork = useStakingCandidatesListByNetwork(network)

  useEffect(() => {
    setLoading(
      !stakingDelegatorStateEntities ? true : !!stakingDelegatorStateLoading
    )
  }, [ stakingDelegatorStateLoading, myAddress ])

  useEffect(() => {
    if (!stakingDelegatorStateEntities || !myAddress) return

    const delegations =
      stakingDelegatorStateEntities[myAddress]?.state?.delegations
    const amounts = delegations?.map((delegation) => delegation.amount)

    if (amounts) {
      const stakeAmount = amounts.length > 1 ? getAmountsSum(amounts) : amounts.pop() || ''

      const stakeAmountWithDecimals = getBalanceWithDecimals({
        totalBalance: stakeAmount,
        decimals: decimal,
      }).toString()

      setMyStake(stakeAmountWithDecimals)
    } else {
      setMyStake('0')
    }
  }, [ loading, network, myAddress ])

  const rows = [
    {
      title: t('staking.table.myStake'),
      desc: loading ? (
        <Skeleton paragraph={{ rows: 0 }} className={styles.TimeSkeleton} />
      ) : (
        <BalanceView value={myStake} symbol={nativeSymbol} />
      ),
    },
    {
      title: t('staking.dashboard.collators'),
      desc: stakingCandidatesByNetwork?.length.toString() || '-',
    },
    {
      title: t('staking.dashboard.transferable'),
      desc: <BalanceView value={transferableBalance} symbol={nativeSymbol} />,
    },
    {
      title: t('staking.dashboard.nextRound'),
      desc: <NextRoundStartDate network={network} />,
    },
  ]

  return (
    <>
      <div className={clsx('lh-base', { ['pl-3 pr-3']: isMobile })}>
        <PageTitle 
          title={<>{chainName} Staking</>}
          link={<FAQModalButton />}
          desc={t('staking.dashboard.desc')}
        />
      </div>

      <div className={styles.DashboardBlock}>
        <Row justify='space-between'>
          {rows?.map(({ title, desc }, index) => {
            return (
              <Col key={index} span={isMobile ? 12 : 6}>
                <DashboardItem
                  title={title}
                  desc={desc}
                  withDivider={
                    isMobile ? index % 2 === 0 : index !== rows.length - 1
                  }
                  withMargin={isMobile && (index === 0 || index === 1)}
                />
              </Col>
            )
          })}
        </Row>
      </div>
    </>
  )
}

export default StakingDashboard
