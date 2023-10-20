import React, { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { PageContent } from '../utils/PageWrapper'
import dynamic from 'next/dynamic'
import ValidatorsStaking from '../staking/validators/ValidatorsStaking'
import { useMyAddresses } from '../providers/MyExtensionAccountsContext'
import { isEthereumAddress } from '@polkadot/util-crypto'
import { validatorStakingNetworks } from '../../config/app/network'
import { WarningMessageBox } from './CollatorStakingPage'

const Footer = dynamic(import('../footer/Footer'), { ssr: false })

export type ValidatorsStakingPageProps = {
  network: string
}

const ValidatorsStakingPage: NextPage<ValidatorsStakingPageProps> = ({ network }) => {
  const [ isSupportedByAddressFormat, setIsSupportedByAddressFormat ] = useState<boolean>(false)
  const addresses = useMyAddresses()

  useEffect(() => {
    if (!addresses) return

    const stakingChainNames = addresses?.every(isEthereumAddress)
      ? []
      : validatorStakingNetworks

    setIsSupportedByAddressFormat(stakingChainNames.includes(network))
  }, [ addresses?.join(','), network ])

  return <>
    <div className='layout-wrapper lh-base'>
      <PageContent
        meta={{
          title: 'Validators Staking',
        }}
        className='position-relative'
      >
        {isSupportedByAddressFormat 
          ? <ValidatorsStaking network={network} /> 
          : <WarningMessageBox addresses={addresses} network={network} />}
      </PageContent>
    </div>
    <Footer />
  </>
}



export default ValidatorsStakingPage