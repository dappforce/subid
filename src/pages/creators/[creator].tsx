import CreatorsStakingPage from 'src/components/main/CreatorStakingPage'
import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchCreatorsList } from '../../rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { FETCH_CHIAN_INFO_WITH_PRICES } from 'src/rtk/app/actions'
import { fetchStakingConsts } from '../../rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import { getOwnerByDomain } from '@/api'

getInitialPropsWithRedux(CreatorsStakingPage, async ({ dispatch, context }) => {
  const { creator } = context.query

  const domainOrSpaceIdFromUrl = creator as string

  const isDomain = domainOrSpaceIdFromUrl?.startsWith('@')

  let spaceId = domainOrSpaceIdFromUrl

  if (isDomain) {
    const domain =
      domainOrSpaceIdFromUrl?.split('.').length > 1
        ? domainOrSpaceIdFromUrl
        : domainOrSpaceIdFromUrl + '.sub'

    const domainStructByDomainName = await getOwnerByDomain(
      domain.replace('@', '')
    )

    const { innerValue } = domainStructByDomainName || {}

    const { space: domainSpaceId } = innerValue || {}

    spaceId = domainSpaceId
  }

  dispatch({ type: FETCH_CHIAN_INFO_WITH_PRICES })
  fetchCreatorsList(dispatch)
  fetchStakingConsts(dispatch)

  return {
    head: {
      title: 'Support Favorite Creators And Receive Tokens!',
      desc: 'Stake SUB towards the best creators of content, applications, and communities. Both you and the creator will receive more tokens, and help grow the network.',
      // TODO: create auto-generated image for particular creator, we can use this one: https://nextjs.org/docs/app/api-reference/functions/image-response
      image: '/images/creator-staking/meta-bg.jpg',
      forceTitle: true,
    },
    spaceId,
  }
})

export default CreatorsStakingPage
