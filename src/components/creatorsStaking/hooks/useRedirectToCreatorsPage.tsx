import { useRouter } from 'next/router'

const useRedirectToCreatorsPage = () => {
  const router = useRouter()

  return () => {
    const creator = router.query.creator

    if (creator) {
      router.replace('/creators', '/creators', { scroll: false })
    }
  }
}

export default useRedirectToCreatorsPage
