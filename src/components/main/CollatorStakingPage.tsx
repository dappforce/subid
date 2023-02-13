import React, { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { PageContent } from '../utils/PageWrapper'
import dynamic from 'next/dynamic'
import CollatorStaking from '../staking/collators/CollatorStaking'
import { StepsEnum, useMyAddresses, useMyExtensionAccount } from '../providers/MyExtensionAccountsContext'
import { MutedSpan } from '../utils/MutedText'
import { isEthereumAddress } from '@polkadot/util-crypto'
import { evmStakingNetworks, supportedStakingNetworks } from 'src/rtk/features/stakingCandidates/utils'
import styles from './Main.module.sass'
import SignInModal from '../onlySearch/SignInModal'
import { Button } from 'antd'
import { startWithUpperCase } from '../utils'
import { useTranslation } from 'react-i18next'

const Footer = dynamic(() => import('../footer/Footer'), { ssr: false })

export type CollatorStakingPageProps = {
  network: string
}

type WarningMessageBoxType = {
  addresses?: string[]
  network: string
}

export const WarningMessageBox = ({ addresses, network }: WarningMessageBoxType) => {
  const [ open, setOpen ] = useState<boolean>(false)
  const { setCurrentStep } = useMyExtensionAccount()
  const { t } = useTranslation()

  const onButtonClick = () => {
    setOpen(true)
    setCurrentStep(StepsEnum.SelectWallet)
  }

  return (
    <div className={styles.WarningMessage}>
      <div className={styles.InnerWarningMessage}>
        <img src='/images/businessman.svg' />
        <div>
          <span className='mb-3'>{t('staking.warnningSection.title')}</span>
          <MutedSpan>{t('staking.warnningSection.desc', { network: startWithUpperCase(network) })}</MutedSpan>
        </div>
        <Button
          type='primary'
          onClick={onButtonClick}
          className='mt-3'
        >
          {t('staking.warnningSection.button')}
        </Button>
      </div>
      <SignInModal open={open} hide={() => setOpen(false)} walletsType={addresses?.every(isEthereumAddress) ? 'all' : 'evm'}/>
    </div>
  )
}

const CollatorStakingPage: NextPage<CollatorStakingPageProps> = ({ network }) => {
  const [ isSupportedByAddressFormat, setIsSupportedByAddressFormat ] = useState<boolean>(false)
  const addresses = useMyAddresses()

  useEffect(() => {
    if (!addresses) return

    const stakingChainNames = addresses?.every(isEthereumAddress)
      ? evmStakingNetworks
      : supportedStakingNetworks

    setIsSupportedByAddressFormat(stakingChainNames.includes(network))
  }, [ addresses?.join(','), network ])

  return <>
    <div className='layout-wrapper'>
      <PageContent
        meta={{
          title: 'Collator Staking',
        }}
        className='position-relative'
      >
        {isSupportedByAddressFormat
          ? <CollatorStaking network={network} />
          : <WarningMessageBox addresses={addresses} network={network} />}
      </PageContent>
    </div>
    <Footer />
  </>
}



export default CollatorStakingPage