import { MutedDiv } from '../../../../utils/MutedText'
import { Space, Table, Tooltip } from 'antd'
import styles from './Modals.module.sass'
import { useMyAddress } from '../../../../providers/MyExtensionAccountsContext'
import { toGenericAccountId } from '../../../../../rtk/app/util'
import { SelectAccount } from '../../../../tips/TipModal'
import { useChainInfo } from '../../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useEffect, useMemo, useState } from 'react'
import { ValidatorInfo } from '../../../../../rtk/features/validators/stakingInfo/types'
import { isDef } from '@subsocial/utils'
import { ColumnsType } from 'antd/lib/table'
import { AccountPreview } from 'src/components/table/utils'
import BN from 'bignumber.js'
import { fetchIdentities } from '../../../../../rtk/features/identities/identitiesHooks'
import { useAppDispatch } from '../../../../../rtk/app/store'
import { convertToBalanceWithDecimal } from '../../../../common/balances/utils'
import { InfoCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { useNominatorInfo } from '../../../../../rtk/features/validators/nominatorInfo/nominatorInfoHooks'
import { useValidators } from '../../../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { Loading, getTokenDecimals } from '../../../../utils/index'
import { useResponsiveSize } from '../../../../responsive/ResponsiveContext'
import { StakingAccountSelect, RewardDestinationSelect } from '../../utils'
import { RewardDestination } from '../../contexts/NominatingContext'

type ChangeControllerAccountProps = {
  network: string
  setController: (controllerId: string) => void
}

export const ChangeControllerAccount = ({ network, setController }: ChangeControllerAccountProps) => {
  const myAddress = useMyAddress()
  const chainsInfo = useChainInfo()
  const { info } = useNominatorInfo(network, myAddress)
  const { t } = useTranslation()

  const { controllerId } = info || {}

  const { ss58Format } = chainsInfo[network] || {}

  return <div className={styles.ChangeControllerModalBody}>
    <MutedDiv>
      {t('validatorStaking.stakingScreen.modals.controller.desc')}
    </MutedDiv>
    <Space direction='vertical' size={24} className='mt-4 w-100'>    
      <Space direction='vertical' size={8} className='w-100'>
        <div className={styles.ControllerInputTitle}>{t('validatorStaking.stakingScreen.modals.controller.stashLabel')}</div>
        <MutedDiv className={styles.ControllerInputDesc}>
          {t('validatorStaking.stakingScreen.modals.controller.stashDesc')}
        </MutedDiv>
        <div className={styles.StashAccount}>
          <SelectAccount address={myAddress || ''} ss58Format={ss58Format} />
        </div>
      </Space>
      <Space direction='vertical' size={8} className='w-100'>
        <div className={styles.ControllerInputTitle}>{t('validatorStaking.stakingScreen.modals.controller.controllerLabel')}</div>
        <MutedDiv className={styles.ControllerInputDesc}>
          {t('validatorStaking.stakingScreen.modals.controller.controllerDesc')}
        </MutedDiv>
        <StakingAccountSelect 
          network={network} 
          setAccount={setController}
          defaultValue={toGenericAccountId(controllerId)} 
          withTitle={false}
        />
      </Space>
    </Space>
  </div>
}

type ChangeReewardDestination = {
  network: string
  rewardDestination: RewardDestination
  setRewardDestination: (rewardDestination: RewardDestination) => void
}

export const ChangeRewardDestination = ({ network, rewardDestination, setRewardDestination }: ChangeReewardDestination) => {
  const myAddress = useMyAddress()
  const { info } = useNominatorInfo(network, myAddress)
  const chainsInfo = useChainInfo()
  const [ bondFromChain, setBondFromChain ] = useState('0')

  const { rewardDestination: rewardDestinationsFromChain, stakingLedger } = info || {}

  const { active } = stakingLedger || {}

  useEffect(() => {
    if(!rewardDestinationsFromChain || !active) return

    const decimal = getTokenDecimals(network, chainsInfo)

    setRewardDestination(rewardDestinationsFromChain)
    setBondFromChain(convertToBalanceWithDecimal(active, decimal).toString())
  }, [ !!active, JSON.stringify(rewardDestinationsFromChain) ])

  return <>
    <RewardDestinationSelect 
      network={network} 
      direction='vertical' 
      setRewardDestination={setRewardDestination} 
      rewardDestination={rewardDestination} 
      bond={bondFromChain}
    />

    {Object.keys(rewardDestination)[0] === 'Account' && <div className='mt-4'>
      <StakingAccountSelect 
        network={network}
        defaultValue={rewardDestination ? Object.values(rewardDestinationsFromChain)[0] || '' : ''} 
        setAccount={((account) => setRewardDestination({ Account: account } as RewardDestination))}
      />
    </div>}
  </>
}

const parseMyValidators = (validators?: ValidatorInfo[]) => {
  const result = validators?.map(validator => {
    const { accountId: address, apy } = validator

    return {
      key: address,
      validator: <AccountPreview 
        name={address}
        account={address} 
        largeAvatar 
        withQr={false}
        halfLength={5}
      />,
      apyValue: apy || '0',
      apy: apy ? <>{apy}%</> : <>-</>
    }
  }).filter(isDef) || []

  return result.sort((a, b) => new BN(b.apyValue).minus(a.apyValue).toNumber())
}

const getMyNominatedvalidatorsColumns = (t: TFunction, isMobile: boolean): ColumnsType<any> => [
  {
    title: <h3 className='font-weight-bold'>
      {t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.table.validator')}
    </h3>,
    dataIndex: 'validator',
    align: 'left'
  },
  {
    title: <h3 className='font-weight-bold'>
      {isMobile ? 'APY' :t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.table.apy')}
      <Tooltip
        className='ml-2'
        title={t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.table.apyDesc')}
      >
        <InfoCircleOutlined />
      </Tooltip>
    </h3>,
    dataIndex: 'apy',
    align: 'right'
  },
]

type MyNominatedValidatorsProps = {
  network: string
}

export const MyNominatedValidators = ({ network }: MyNominatedValidatorsProps) => {
  const myAddress = useMyAddress()
  const dispatch = useAppDispatch()
  const { t, i18n: { language } } = useTranslation()
  const { isMobile } = useResponsiveSize()

  const { info } = useNominatorInfo(network, myAddress)
  
  const { nominators } = info || {}
  const { validators, loading } = useValidators(network, nominators)

  const myNominatedvalidatorsColumns = useMemo(() => getMyNominatedvalidatorsColumns(t, isMobile), [ language ])

  const validatorsData = useMemo(() => {
    if(!validators) return []

    const data = parseMyValidators(validators)

    const validatorsIds = data.map(validator => validator.key)
    fetchIdentities(dispatch, validatorsIds)

    return data
  }, [ validators.length, network ])

  return loading ? <Loading label='Loading validators...' /> : <Table 
    dataSource={validatorsData} 
    className={styles.ValidatorsTable}
    columns={myNominatedvalidatorsColumns}
    pagination={false} 
  />  
}