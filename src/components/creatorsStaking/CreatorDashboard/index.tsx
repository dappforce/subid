import { useMyAddress } from 'src/components/providers/MyExtensionAccountsContext'
import DashboardCards from './DashboardCards'
import { useCreatorsList } from 'src/rtk/features/creatorStaking/creatorsList/creatorsListHooks'
import { toGenericAccountId } from '../../../rtk/app/util'
import { isEmptyArray } from '@subsocial/utils'

const CreatorDashboard = () => {
  const myAddress = useMyAddress()
  const creatorsList = useCreatorsList()

  const creators = creatorsList?.filter(
    (item) => toGenericAccountId(item.creator.stakeholder) === myAddress
  )

  if (!creators || isEmptyArray(creators)) return null

  return (
    <div className='flex flex-col gap-4'>
      <div className='text-2xl UnboundedFont md:px-6 px-0'>
        My Creator Dashboard
      </div>

      <div className='w-full flex flex-col gap-4 bg-white rounded-[20px] md:p-6 p-4'>
        <div className='px-0 md:flex-row flex-col md:items-center !items-start'>
          <DashboardCards creators={creators} />
        </div>
      </div>
    </div>
  )
}

export default CreatorDashboard
