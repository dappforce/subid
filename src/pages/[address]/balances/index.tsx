import { useRouter } from 'next/router'
import { useEffect } from 'react'

const BalancesPage = () => {
  const { query, replace } = useRouter()

  const address = query.address as string

  useEffect(() => {
    if (!address) return
    
    replace({ pathname: '/[address]', query: { ...query, tab: 'portfolio' } })
  }, [ address ])

  return <></>
}

export default BalancesPage
