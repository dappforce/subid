import { Form, Space, FormInstance, Tooltip, Divider } from 'antd'
import { useNominatingStakingContext, RewardDestination } from '../contexts/NominatingContext'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import styles from '../ValidatorStaking.module.sass'
import { BigNumber } from 'bignumber.js'
import { BondInput, RewardDestinationSelect, StakingAccountSelect } from '../utils'
import { InfoCircleOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { ModalType } from '../validatorStaking/modals/StakeMoreModal'
import { convertToBalanceWithDecimal } from '../../../common/balances/utils'
import { BalanceView } from '../../../homePage/address-views/utils/index'
import { useTranslation } from 'react-i18next'
import { useStakingProps } from '../../../../rtk/features/validators/stakingProps/stakingPropsHooks'
import { useStakingInfo } from '../../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { getTokenSymbol, getTokenDecimals } from '../../../utils/index'
import { BIGNUMBER_ZERO } from '../../../../config/app/consts'
import { useResponsiveSize } from '../../../responsive/ResponsiveContext'

export type StartNominatingBondInputProps = {
  form: FormInstance
  network: string
  type?: ModalType
  isModal?: boolean
}

const StartNominatingBondInput = (props: StartNominatingBondInputProps) => {
  const { setBond, bond } = useNominatingStakingContext()

  return <BondInput {...props} setAmount={setBond} amount={bond}/>
}

export type SpaceDirection = 'horizontal' | 'vertical'

export type StartNominatingRewardDestinationProps = {
  direction?: SpaceDirection
  network: string
}

const StartNominatingRewardDestination = (props: StartNominatingRewardDestinationProps) => {
  const { rewardDestination, setRewardDestination, bond } = useNominatingStakingContext()

  return <RewardDestinationSelect 
    {...props} 
    rewardDestination={rewardDestination} 
    setRewardDestination={setRewardDestination} 
    bond={bond}
  />
}

type MinBondSectionItemProps = {
  label: string
  desc: string
  value: BigNumber
  symbol: string
}

const MinBondSectionItem = ({ label, desc, value, symbol }: MinBondSectionItemProps) => {
  const { isMobile } = useResponsiveSize()

  return <div className={
    clsx('d-flex align-items-center', { ['justify-content-between']: !isMobile, ['flex-column']: isMobile })
  }>
    <div className='MutedText grey text d-flex align-items-center'>
      {label}
      <Tooltip title={desc}>
        <InfoCircleOutlined className='ml-2' />
      </Tooltip>
    </div>
    <BalanceView value={value.toFormat()} symbol={symbol} fullPostfix className={clsx('SemiBold', { ['mt-1']: isMobile })} />
  </div>}

type StakeBlockProps = {
  network: string
}

export const StakeBlock = ({ network }: StakeBlockProps) => {
  const [ form ] = Form.useForm()
  const { rewardDestination, setRewardDestination } = useNominatingStakingContext()
  const validatorStakingInfo = useStakingInfo(network)
  const stakingProps = useStakingProps(network)
  const chainsInfo = useChainInfo()
  const { t } = useTranslation()
  const { isMobile } = useResponsiveSize()

  const { stakingInfo } = validatorStakingInfo || {}

  const symbol = getTokenSymbol(network, chainsInfo)
  const decimals = getTokenDecimals(network, chainsInfo)


  const { minNominatorBond } = stakingProps || {}
  const { minNominated } = stakingInfo || {}

  const minNominatorBondWithDecimals = minNominatorBond ? convertToBalanceWithDecimal(minNominatorBond, decimals) : BIGNUMBER_ZERO
  const minActiveNominatedWithDecimals = minNominated ? convertToBalanceWithDecimal(minNominated, decimals) : BIGNUMBER_ZERO

  const minBondSectionItemsOpt = [
    {
      label: t('validatorStaking.startNominatingScreen.stakeBlock.minimumStake.title'),
      desc: t('validatorStaking.startNominatingScreen.stakeBlock.minimumStake.desc'),
      value: minNominatorBondWithDecimals
    },
    {
      label: t('validatorStaking.startNominatingScreen.stakeBlock.minimumActiveStake.title'),
      desc: t('validatorStaking.startNominatingScreen.stakeBlock.minimumActiveStake.desc'),
      value: minActiveNominatedWithDecimals
    },
  ]

  const minBondSectionItems = minBondSectionItemsOpt.map((props, i) => 
    <MinBondSectionItem key={i} symbol={symbol} {...props} />
  )

  return <Form form={form} layout='vertical' className='mt-0'>
    <Space className='w-100' size={24} direction='vertical'>
      <StartNominatingBondInput network={network} form={form} />
      <Space 
        direction='vertical' 
        size={16} 
        className={clsx('w-100', styles.MinBondSection)}
        split={isMobile ? <Divider className='m-0 mt-1 mb-1' /> : undefined}
      >
        {minBondSectionItems}
      </Space>
      <StartNominatingRewardDestination network={network}/>

      {Object.keys(rewardDestination)[0] === 'Account' && 
        <StakingAccountSelect 
          network={network} 
          setAccount={((account) => setRewardDestination({ Account: account } as RewardDestination))}
      />}
    </Space>
  </Form>
}