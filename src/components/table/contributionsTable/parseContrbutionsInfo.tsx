import { RelayChain } from '../../../types/index'
import { CrowdloanInfo } from '../../identity/types'
import { isEmptyArray, nonEmptyArr, isDef, pluralize } from '@subsocial/utils'
import { sendGuestGaEvent } from '../../../ga/events'
import {
  getBalanceWithDecimals,
  getCrowdloanStatus,
  disableContributionButton,
  ChainData,
  LabelAndDescription,
  LabelWithShortMoneyFormat,
} from '../utils'
import { contributionInfoByRelayChain, ContributionInfo, defaultContributionLink } from '../links'
import styles from '../Table.module.sass'
import { ContributeDetailsModal } from '../ContributeDetailsModal'
import { ExternalLink } from '../../identity/utils'
import { Button, Tooltip } from 'antd'
import { startWithUpperCase, SubIcon } from '../../utils/index'
import React from 'react'
import { CardChildren, CrowdloansTableInfo } from '../types'
import { partition } from 'lodash'
import BN from 'bignumber.js'
import { CrowdloanContributions } from '../../../rtk/features/contributions/types'
import { NetworkByParaId } from '../../../rtk/features/multiChainInfo/networkByParaId'
import { getPrice, getBalances, AccountPreview, getParentBalances } from '../utils'
import { ContributionsRecord } from '../../../rtk/features/contributions/contributionsSlice'
import { AccountIdentitiesRecord } from '../../../rtk/features/identities/identitiesSlice'
import { MultiChainInfo } from '../../../rtk/features/multiChainInfo/types'
import { getSubsocialIdentityByAccount } from '../../../rtk/features/identities/identitiesHooks'
import clsx from 'clsx'
import { MutedDiv } from '../../utils/MutedText'
import { TFunction } from 'i18next'
import ClaimCrowdloanButton from 'src/components/crowdloan/ClaimCrowdloanButton'
import { AccountVestingCrowdloanBalance } from './VestingCrowdloanBalance'
import { InfoCircleOutlined } from '@ant-design/icons'
import { formatDate } from 'src/utils/date'
import { BIGNUMBER_ZERO } from '../../../config/app/consts'
import { LinksButton } from '../balancesTable/Links'
import { GiReceiveMoney } from 'react-icons/gi'

type ParseCrowdloanTableInfoProps = {
  relayChain: RelayChain
  chainsInfo: MultiChainInfo
  tokenPrices: any
  identities?: AccountIdentitiesRecord
  crowdloansInfo: CrowdloanInfo[]
  networkByParaId: NetworkByParaId
  balances?: ContributionsRecord
  isMulti?: boolean
  t: TFunction
}

const LINE = <MutedDiv>−</MutedDiv>

const parseContributions = (paraId: string, balances: CrowdloanContributions, priceValue: string, symbol: string, decimals: number, t: TFunction) => {
  const contributionObj = balances[paraId]

  if (!contributionObj) return

  const { contribution = '0', network, leaseEnd } = contributionObj

  const contributionValue = getBalanceWithDecimals({ totalBalance: contribution, decimals })

  const { balance, price, totalValue, total } = getBalances({ balanceValue: contributionValue, priceValue, symbol, t })

  const isReturned = (parseInt(leaseEnd ?? '0')) < Date.now()

  return {
    contributionValue,
    totalValue,
    price,
    contribution: balance,
    total,
    network,
    leaseEnd,
    isReturned
  }
}

type CommonAttributes = Pick<CrowdloansTableInfo, 'isReturned' | 'leaseEnd'>
function setDataIfDefined <T> (data: T, attribute: keyof T, value: T[typeof attribute]) {
  const newValue = value || data[attribute]
  data[attribute] = newValue
}

export const parseCrowdloansTableInfo = ({
  relayChain,
  chainsInfo,
  tokenPrices,
  crowdloansInfo,
  identities,
  balances,
  networkByParaId,
  isMulti,
  t
}: ParseCrowdloanTableInfoProps): CrowdloansTableInfo[] => {
  const { tokenDecimals, tokenSymbols, name: relayChainName } = chainsInfo[relayChain]

  if (!balances) return []

  const decimals = tokenDecimals && !isEmptyArray(tokenDecimals) ? tokenDecimals[0] : 0
  const symbol = tokenSymbols && !isEmptyArray(tokenSymbols) ? tokenSymbols[0] : ''

  const priceValue = getPrice(tokenPrices, 'symbol', symbol)

  const crowdloans = crowdloansInfo.map((crowdloan) => {
    const { paraId, isCapped, isWinner, isEnded, raised, cap } = crowdloan

    const networkNameByParaId = networkByParaId[`${paraId}-${relayChain}`]
    const { name, icon } = chainsInfo[networkNameByParaId]

    const balancesByAccountEntries = Object.entries(balances)
    const commonAttributes: CommonAttributes = {}

    const contributions = balancesByAccountEntries.map(([ key, { contributions: balance } ]) => {
      const address = key.split('-')[0] as string

      if (!balance) return

      const parsedContribution = parseContributions(paraId.toString(), balance, priceValue, symbol, decimals, t)

      if (!parsedContribution) return

      const {
        contributionValue,
        totalValue,
        contribution,
        total,
        leaseEnd,
        isReturned
      } = parsedContribution

      if (contributionValue.isZero() && isMulti) return

      const subsocialIdentity = getSubsocialIdentityByAccount(address, identities)

      const chain = <AccountPreview
        name={relayChainName}
        account={address}
        avatar={subsocialIdentity?.image}
        halfLength={5}
      />

      setDataIfDefined(commonAttributes, 'isReturned', isReturned)
      setDataIfDefined(commonAttributes, 'leaseEnd', leaseEnd)

      const linksButton = <LinksButton network={networkNameByParaId} showActionButton={false} />

      return {
        key: key,
        address,
        chain: isMulti ? <div className='ml-5'>{chain}</div> : chain,
        balance: <div className={clsx({ ['mr-4']: isMulti })}><LabelAndDescription label={contribution} desc={<>≈ {total}</>} /></div>,
        balanceValue: contributionValue,
        totalValue,
        refBonus: LINE,
        raised: LINE,
        cap: LINE,
        rewardPool: LINE,
        status: LINE,
        leaseEnd,
        isReturned,
        links: linksButton,
        showLinks: () => linksButton,
        claimable: <AccountVestingCrowdloanBalance className='text-center' network={networkNameByParaId} address={address} />,
        claimRewards: (
          <ClaimCrowdloanButton
            network={networkNameByParaId}
            address={address}
            label={<SubIcon Icon={GiReceiveMoney} />}
            type='primary'
            shape='circle'
            ghost
            size='small'
          />
        ),
      }
    }).filter(isDef)

    const raisedValue = raised ? getBalanceWithDecimals({ totalBalance: new BN(raised).toString(), decimals }) : BIGNUMBER_ZERO
    const capValue = cap ? getBalanceWithDecimals({ totalBalance: new BN(cap).toString(), decimals }) : BIGNUMBER_ZERO

    const raisedPercent = raisedValue.dividedBy(capValue).multipliedBy(new BN(100))

    const statusValue = isDef(isCapped) && isDef(isWinner) && isDef(isEnded) 
      ? getCrowdloanStatus(isCapped, isWinner, isEnded) 
      : 'Ended'

    const contributeEvent = () => sendGuestGaEvent(`Contribute to ${networkNameByParaId}`)

    const contribByRelayChain = contributionInfoByRelayChain[relayChain]

    const contribInfo: ContributionInfo = contribByRelayChain[networkNameByParaId] || {}
    const { refBonus = LINE, contribLink = defaultContributionLink[relayChain], details, rewardPool = LINE } = contribInfo

    let statusColumnTooltip = ''
    if (commonAttributes.leaseEnd) {
      const translationInfo = { token: symbol, date: formatDate(commonAttributes.leaseEnd) }
      statusColumnTooltip = commonAttributes.isReturned
        ? t('table.crowdloan.lockInfo.unlocked', translationInfo)
        : t('table.crowdloan.lockInfo.lockedUntil', translationInfo)
    }

    let status = (
      <div className={clsx(styles[statusValue], 'position-relative mr-3')}>
        {statusValue}
        {statusColumnTooltip && (
          <MutedDiv className={clsx(styles.StatusTooltip)}>
            <Tooltip title={statusColumnTooltip}>
              <InfoCircleOutlined />
            </Tooltip>
          </MutedDiv>
        )}
      </div>
    )

    const isDisabledButton = disableContributionButton.includes(networkNameByParaId)

    if (statusValue === 'Active') {
      status = details ? <ContributeDetailsModal details={details} sendEvent={contributeEvent} network={networkNameByParaId} /> : (
        <Button className={styles.ActiveCrowdloan} disabled={isDisabledButton} onClick={contributeEvent} shape='round'>
          <ExternalLink url={contribLink} value={t('buttons.contribute')} />
        </Button>
      )
    }

    const raisedDisplay = <LabelAndDescription
      label={<LabelWithShortMoneyFormat value={raisedValue} symbol={symbol} />}
      desc={<>{raisedPercent.toFixed(0)}%</>}
    />
    const capDisplay = <LabelWithShortMoneyFormat value={capValue} symbol={symbol} />

    const commonFields = {
      key: networkNameByParaId,
      networkName: networkNameByParaId,
      chain: <ChainData icon={icon} name={startWithUpperCase(name)} />,
      name: startWithUpperCase(name),
      icon: icon,
      refBonus,
      raised: isDef(raised) ? raisedDisplay : LINE,
      cap: isDef(cap) ? capDisplay : LINE,
      capValue,
      rewardPool,
      raisedValue,
      status,
      statusValue,
      ...commonAttributes
    }

    const generateCardAdditionalData = (contribution?: typeof contributions[number]): CardChildren => {
      const cardChildren: CardChildren = {
        data: [
          { label: 'Raised', value: raisedDisplay },
          { label: 'Cap', value: capDisplay },
          { label: 'Reward %', value: rewardPool },
          { label: 'Referral Bonus', value: refBonus },
        ],
      }
      if (contribution && !isMulti) {
        cardChildren.data?.push({
          label: 'Claimable / Remaining',
          value: <div className='d-flex align-items-center'>
            <AccountVestingCrowdloanBalance className='text-right' oneLine network={networkNameByParaId} address={contribution.address} />
            <ClaimCrowdloanButton
              className='ml-2'
              network={networkNameByParaId}
              address={contribution.address}
              label={<SubIcon Icon={GiReceiveMoney} />}
              type='primary'
              shape='circle'
              ghost
              size='small'
            />
          </div>
        })
      }
      return cardChildren
    }

    if (isMulti) {
      const {
        balanceValueBN,
        totalValueBN,
        balance,
        total
      } = getParentBalances(contributions as unknown as CrowdloansTableInfo[], symbol)

      const childrenBalances: any = {}

      if (nonEmptyArr(contributions)) {
        const contributionsWithChildren = contributions.map((contribution) => ({
          ...contribution,
          cardChildren: generateCardAdditionalData(contribution)
        }))
        childrenBalances.children = contributionsWithChildren
      }

      const contributionLabelAndDesc = <LabelAndDescription label={balance} desc={<>≈ {total}</>} />

      const contributionPart = <div className='d-grid mr-4'>
        <span>{contributionLabelAndDesc}</span>
      </div>

      const childrenLength = contributions.length

      const numberOfAccounts = childrenLength ? pluralize({ count: childrenLength, singularText: 'account', pluralText: 'accounts' }) : ''

      const chain = <ChainData
        icon={icon}
        name={name}
        accountId={numberOfAccounts}
        isMonosizedFont={false}
        withCopy={false}
      />

      return [ {
        ...commonFields,
        chain,
        address: numberOfAccounts,
        balance: contributionPart,
        balanceValue: balanceValueBN,
        totalValue: totalValueBN,
        balanceWithoutChildren: contributionLabelAndDesc,
        balanceView: contributionPart,
        cardChildren: generateCardAdditionalData(),
        ...childrenBalances
      } ]
    } else {
      return contributions.map((contribution, idx) => {
        return {
          ...contribution,
          ...commonFields,
          key: `${networkNameByParaId}-${idx}`,
          cardChildren: generateCardAdditionalData(contribution)
        }
      })
    }
  })

  const flatCrowdloans = crowdloans.flat()

  const [ activeCrowdloans, winnerCrowdloans ] = partition(flatCrowdloans, (x) => x.statusValue === 'Active')

  const [ subsocialCrowdloan, otherActiveCrowdloans ] = partition(activeCrowdloans, (x) => x.key === 'subsocial')

  const activeCrowdloansSorted = otherActiveCrowdloans.sort((a, b) =>
    b.raisedValue.minus(a.raisedValue).toNumber()
  )

  const winnerCrowdloansSorted = winnerCrowdloans.sort((a, b) => (
    b.balanceValue.minus(a.balanceValue).toNumber() ||
    b.raisedValue.minus(a.raisedValue).toNumber()) ||
    b.capValue.minus(a.capValue).toNumber()
  )

  const crowdloansSorted: CrowdloansTableInfo[] = relayChain === 'kusama' ? [ ...subsocialCrowdloan ] : []

  crowdloansSorted.push(...activeCrowdloansSorted, ...winnerCrowdloansSorted)

  return crowdloansSorted
}