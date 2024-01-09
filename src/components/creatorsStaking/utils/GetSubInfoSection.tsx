import { useMyAddress } from '@/components/providers/MyExtensionAccountsContext'
import { useBalances } from '@/rtk/features/balances/balancesHooks'
import { getTransferableBalance } from '@/utils/balance'
import { MdInfo } from 'react-icons/md'
import Button from '../tailwind-components/Button'
import { useEffect, useState } from 'react'
import { useResponsiveSize } from '@/components/responsive'
import clsx from 'clsx'
import { getAddressFromStorage } from '@/components/utils'

export const GetSubInfoSection = () => {
  const myAddress = useMyAddress()
  const balancesByAccount = useBalances(myAddress)
  const { isMobile } = useResponsiveSize()

  const { balances, loading } = balancesByAccount || {}
  const [ hideInfoSection, setHideInfoSection ] = useState(true)

  useEffect(() => {
    const address = getAddressFromStorage()
    if (!address) {
      setHideInfoSection(false)
      return
    }

    if (loading === undefined) return setHideInfoSection(true)

    const balanceByNetwork =
      balances?.find((x) => x.network === 'subsocial') || ({} as any)

    const subBalance = balanceByNetwork?.info?.['SUB']
    const transferableBalance = getTransferableBalance(subBalance)
    setHideInfoSection(!transferableBalance.isZero() || loading)
  }, [ loading ])

  if (hideInfoSection) return null

  return (
    <div
      className={clsx(
        'flex md:flex-row flex-col items-center gap-3 justify-between p-4',
        'rounded-[20px] bg-blue-50 text-text-primary md:!mx-4 mx-0'
      )}
    >
      <div className='flex items-center gap-4 md:flex-row flex-col'>
        <MdInfo size={isMobile ? 30 : 20} />
        <div className='md:text-start text-center'>
          In order to participate in Creator Staking, you will need SUB tokens.
        </div>
      </div>
      <Button
        href='https://subsocial.network/get-sub/'
        className='hover:text-white focuf:text-white'
        target='_blank'
        variant='primary'
        size='md'
      >
        Get SUB
      </Button>
    </div>
  )
}

export default GetSubInfoSection
