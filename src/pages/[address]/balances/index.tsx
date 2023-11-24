import { useRouter } from 'next/router'
import { useEffect } from 'react'

const BalancesPage = () => {
  const { query, push } = useRouter()

  const address = query.address as string

  useEffect(() => {
    if (!address) return
    push({ pathname: '/[address]', query: { ...query, tab: 'portfolio' } })
  }, [address])

  return <></>
}

export default BalancesPage
