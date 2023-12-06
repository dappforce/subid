import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData } from '../../rtk/app/util'
import TransferPage from '@/components/main/TransferPage'

getInitialPropsWithRedux(TransferPage, async ({ dispatch, context }) => {
  fetchData(dispatch)

  const { transferType, asset, from, to } = context.query

  const assetValue = asset as string

  return {
    head: {
      title: 'Transfer Page',
    },
    transferType: transferType as string || 'same',
    asset: assetValue ? assetValue.toUpperCase() : undefined,
    from: from as string,
    to: to as string,
  }
})

export default TransferPage
