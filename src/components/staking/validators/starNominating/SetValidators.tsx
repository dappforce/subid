import Table, { ColumnsType } from 'antd/lib/table'
import { TFunction } from 'i18next'
import { Tooltip, Collapse, Space } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { isDef } from '@subsocial/utils'
import { MultiChainInfo } from '../../../../rtk/features/multiChainInfo/types'
import { StakingInfo, ValidatorInfo } from '../../../../rtk/features/validators/stakingInfo/types'
import { convertToBalanceWithDecimal } from '../../../common/balances/utils'
import { BalanceView } from '../../../homePage/address-views/utils/index'
import { ValidatorAccountPreview } from '../utils'
import BigNumber from 'bignumber.js'
import { useAppDispatch } from '../../../../rtk/app/store'
import { useNominatingStakingContext } from '../contexts/NominatingContext'
import { useChainInfo } from '../../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { useStakingProps } from '../../../../rtk/features/validators/stakingProps/stakingPropsHooks'
import { useStakingInfo } from '../../../../rtk/features/validators/stakingInfo/stakingInfoHooks'
import { useTranslation } from 'react-i18next'
import { useResponsiveSize } from '../../../responsive/ResponsiveContext'
import { useEffect, useMemo, useState } from 'react'
import { fetchIdentities } from '../../../../rtk/features/identities/identitiesHooks'
import { MutedDiv } from '../../../utils/MutedText'
import clsx from 'clsx'
import styles from '../ValidatorStaking.module.sass'
import { Loading, getTokenSymbol, getTokenDecimals } from '../../../utils/index'
import { shuffle } from 'lodash'
import BN from 'bignumber.js'

const { Panel } = Collapse 

const VALIDATORS_TABLE_PAGE_SIZE = 16

const FULL_VALIDATORS_COMMISSION_PER = 100

const getColumns = (tokenSymbol: string, t: TFunction, isMobile: boolean): ColumnsType<any> => {
  const stakeAmount = isMobile ? [ undefined ] : [ {
    title: <h3 className='font-weight-bold'>
      {t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.table.stakeAmount')}, {tokenSymbol}
    </h3>,
    dataIndex: 'staked',
    align: 'right'
  } ] as ColumnsType<any>

  return [
    {
      title: <h3 className='font-weight-bold'>
        {t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.table.validator')}
      </h3>,
      dataIndex: 'validator',
      align: 'left',
      className: styles.ValidatorsColumn
    },
    ...stakeAmount,
    {
      title: <h3 className='font-weight-bold'>
        {isMobile ? 'APY' : t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.table.apy')}
        <Tooltip
          className='ml-2'
          title={t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.table.apyDesc')}
        >
          <InfoCircleOutlined />
        </Tooltip>
      </h3>,
      dataIndex: 'apy',
      align: 'right',
    },
  ].filter(isDef) as ColumnsType<any>
}

type FilterValidatorsProps = {
  validators?: ValidatorInfo[]
  isActiveValidator?: boolean
}

const filterValidators = ({ validators, isActiveValidator = false }: FilterValidatorsProps) => (
  validators?.filter(({ commissionPer, isBlocking, isActive }) => (
    !isBlocking && commissionPer !== FULL_VALIDATORS_COMMISSION_PER && isActiveValidator ? isActive : !isActive
  )) || []
)

const VALIDATORS_OFFSET = 3

export const getOptimalValidators = (maxNominations: string, validators?: ValidatorInfo[], ) => {
  const maxNominationsBN = new BN(maxNominations)
  const waitingValidatorsCount = maxNominationsBN.dividedBy(VALIDATORS_OFFSET)

  let waitingValidators = filterValidators({ validators })
  let activeValidators = filterValidators({ validators, isActiveValidator: true })

  if (waitingValidators?.length) {
    waitingValidators = shuffle(waitingValidators).slice(0, waitingValidatorsCount.toNumber())
  }

  if (activeValidators?.length) {
    activeValidators = shuffle(activeValidators).slice(0, maxNominationsBN.minus(waitingValidatorsCount).toNumber())
  }

  return shuffle([ ...activeValidators, ...waitingValidators ])
}

const parseValidators = (chainsInfo: MultiChainInfo, network: string, stakingInfo?: StakingInfo) => {
  if(!stakingInfo) return []

  const { validators } = stakingInfo

  const validatorsValues = validators ? Object.values(validators) : []

  const nativeSymbol = getTokenSymbol(network, chainsInfo)

  const decimals = getTokenDecimals(network, chainsInfo)

  const result = validatorsValues?.map(validator => {
    const { accountId: address, bondTotal: total, apy } = validator

    const totalValue = convertToBalanceWithDecimal(total, decimals)

    const balance = <BalanceView value={totalValue} symbol={nativeSymbol} withSymbol={false} className='SemiBold' /> 

    return {
      key: address,
      validator: <ValidatorAccountPreview address={address} />,
      staked: balance,
      apyValue: apy || '0',
      apy: <div className='SemiBold'>{apy ? <>{apy}%</> : <>-</>}</div>
    }
  }).filter(isDef) || []

  return result.sort((a, b) => new BigNumber(b.apyValue).minus(a.apyValue).toNumber())
}

type ManualValidatorsSelectProps = {
  selectedOpt: string
  network: string 
}

const ManualValidatorsSelect = ({ selectedOpt, network }: ManualValidatorsSelectProps) => {
  const { selectedValidators: selectedRowKeys, setSelectedValidators: setSelectedRowKeys } = useNominatingStakingContext()
  const dispatch = useAppDispatch()
  const chainsInfo = useChainInfo()
  const stakingProps = useStakingProps(network)
  const tokenSymbol = getTokenSymbol(network, chainsInfo)
  const validatorStakingInfo = useStakingInfo(network)
  const { t } = useTranslation() 
  const { isMobile } = useResponsiveSize() 

  const { stakingInfo, loading } = validatorStakingInfo || {}

  const { maxNominations } = stakingProps || {}

  const validatorsData = useMemo(() => {
    if(!stakingInfo) return []

    const data = parseValidators(chainsInfo, network, stakingInfo)

    const validatorsIds = data.slice(0, VALIDATORS_TABLE_PAGE_SIZE).map(validator => validator.key)
    fetchIdentities(dispatch, validatorsIds, false)

    return data
  }, [ network, !!stakingInfo ])

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    if(maxNominations && newSelectedRowKeys.length <= parseInt(maxNominations)) {
      setSelectedRowKeys(newSelectedRowKeys as string[])
    }
  }
  
  const onPaginationChange = (page: number, pageSize?: number) => {
    if(pageSize) {
      const start = (page - 1) * pageSize

      const validatorsSlice = validatorsData.slice(start, start + pageSize)

      const validatorsIds = validatorsSlice.map(validator => validator.key).filter(isDef)

      fetchIdentities(dispatch, validatorsIds, false)
    }
  }

  return <Collapse
    accordion
    ghost
    expandIcon={() => null}
    onChange={(key) => {
      key === 'select' && setSelectedRowKeys([])
    }}
    activeKey={selectedOpt === 'select' ? 'select' : undefined}
  >
    <Panel 
      key='select' 
      header={<h3 className='bs-mb-0'>
        {t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.title')}
      </h3>}
    >
      <MutedDiv className='FontNormal mt-3'>
        {t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.desc', { maxNominations: maxNominations || '' })}
      </MutedDiv>
      <div className='mt-4'>
        <div className={styles.SelectedValidators}>
          {t('validatorStaking.startNominatingScreen.setValidatorsBlock.selectByYourself.selectedValidators')} {selectedRowKeys?.length}
        </div>
        {loading ? <Loading label='Loading validators...' /> : <Table 
          dataSource={validatorsData} 
          className={styles.ValidatorsTable}
          columns={getColumns(tokenSymbol, t, isMobile)} 
          rowSelection={{ selectedRowKeys, onChange: onSelectChange, hideSelectAll: true }}
          pagination={{ 
            hideOnSinglePage: true, 
            defaultPageSize: VALIDATORS_TABLE_PAGE_SIZE, 
            onChange: onPaginationChange, 
            showSizeChanger: false 
          }}
        />}
      </div>
    </Panel>
  </Collapse>
}

type SetValidatorsProps = {
  network: string
}

export const SetValidators = ({ network }: SetValidatorsProps) => {
  const [ selectedOpt, setSelectedOpt ] = useState('recommended')
  const { setSelectedValidators } = useNominatingStakingContext()
  const validatorStakingInfo = useStakingInfo(network)
  const stakingProps = useStakingProps(network)
  const { t } = useTranslation()

  const { stakingInfo } = validatorStakingInfo || {}
  const { maxNominations } = stakingProps || {}

  useEffect(() => {
    const validators = stakingInfo?.validators

    if(!maxNominations || !validators) return

    const validatorsValues = validators ? Object.values(validators) : []

    const optimalValidators = getOptimalValidators(maxNominations, validatorsValues)

    setSelectedValidators(optimalValidators.map((validator) => validator.accountId))
  }, [ stakingInfo?.validators?.length, network, maxNominations ])

  const onItemClick = (option: string) => {
    if(selectedOpt !== option) {
      setSelectedValidators([])
      setSelectedOpt(option)

      if(option === 'recommended') {
        const validators = stakingInfo?.validators
        
        if(!maxNominations || !validators) return

        const validatorsValues = validators ? Object.values(validators) : []
  
        const optimalValidators = getOptimalValidators(maxNominations, validatorsValues)
  
        setSelectedValidators(optimalValidators.map((validator) => validator.accountId))
      }
    }
  }

  return <Space size={16} direction='vertical' className='w-100'>
    <div 
      className={clsx(styles.SetValidatorsCard, { [styles.SelectedItem]: selectedOpt === 'recommended' })} 
      onClick={() => onItemClick('recommended') }
    >
      <h3>{t('validatorStaking.startNominatingScreen.setValidatorsBlock.recommended.title')}</h3>
      <MutedDiv>
        {t('validatorStaking.startNominatingScreen.setValidatorsBlock.recommended.desc')}
      </MutedDiv>
    </div>
    <div 
      onClick={() => {
        onItemClick('select')
      }}
      className={clsx(styles.CollapseValidatorCard, { [styles.SelectedItem]: selectedOpt === 'select' })} 
    >
    <ManualValidatorsSelect 
      selectedOpt={selectedOpt} 
      network={network} 
    />
    </div>
  </Space>
}