import { useRouter } from 'next/router'
import { useEffect } from 'react'

const NftsPage = () => {
  const { query, replace } = useRouter()

  const address = query.address as string

  useEffect(() => {
    if(!address) return
    
    replace({ pathname: '/[address]', query: { ...query, tab: 'nfts' } })
  }, [ address ])

  return <></>
}

export default NftsPage
