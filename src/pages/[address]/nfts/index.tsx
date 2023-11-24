import { useRouter } from 'next/router'
import { useEffect } from 'react'

const NftsPage = () => {
  const { query, push } = useRouter()

  const address = query.address as string

  useEffect(() => {
    if(!address) return
    push({ pathname: '/[address]', query: { ...query, tab: 'nfts' }})
  }, [address])

  return <></>
}

export default NftsPage
