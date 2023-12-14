import CreatorsStakingPage from 'src/components/main/CreatorStakingPage'
import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchCreatorsList } from '../../rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { FETCH_CHIAN_INFO_WITH_PRICES } from 'src/rtk/app/actions'
import { fetchStakingConsts } from '../../rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import { getDomainBySpaceId, getOwnerByDomain } from '@/api'
import { tryParseInt } from '@/components/utils'

getInitialPropsWithRedux(CreatorsStakingPage, async ({ dispatch, context }) => {
  const { creator } = context.query

  const domainOrSpaceId = creator as string

  const isDomain = !tryParseInt(domainOrSpaceId as string, 0)

  let domain = ''
  let spaceId = ''

  if (isDomain) {
    domain =
      domainOrSpaceId.split('.').length > 1
        ? domainOrSpaceId
        : domainOrSpaceId + '.sub'
    const domainStructByDomainName = await getOwnerByDomain(domain)

    console.log(domainStructByDomainName)

    const { innerValue } = domainStructByDomainName || {}

    const { space: domainSpaceId } = innerValue || {}

    spaceId = domainSpaceId
  } else {
    domain = await getDomainBySpaceId(domainOrSpaceId)
    spaceId = domainOrSpaceId
  }

  dispatch({ type: FETCH_CHIAN_INFO_WITH_PRICES })
  fetchCreatorsList(dispatch)
  fetchStakingConsts(dispatch)

  return {
    head: {
      title: 'Support Favorite Creators And Receive Tokens!',
      desc: 'Stake SUB towards the best creators of content, applications, and communities. Both you and the creator will receive more tokens, and help grow the network.',
      image: '/images/creator-staking/meta-bg.jpg',
      forceTitle: true,
    },
    spaceId,
    domain,
  }
})

export default CreatorsStakingPage
