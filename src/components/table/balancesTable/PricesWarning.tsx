import AlertPanel from '@/components/utils/AlertPanel'
import { useAppDispatch } from '@/rtk/app/store'
import { useChainInfo } from '@/rtk/features/multiChainInfo/multiChainInfoHooks'
import {
  getChainsNamesForCoinGecko,
  usePricesData,
} from '@/rtk/features/prices/pricesHooks'
import { pricesActions } from '@/rtk/features/prices/pricesSlice'
import { Button } from 'antd'
import styles from './utils/Index.module.sass'
import clsx from 'clsx'

const PricesWarning = () => {
  const pricesEntity = usePricesData()
  const chainsInfo = useChainInfo()
  const dispatch = useAppDispatch()

  const { pricesData, loading } = pricesEntity || {}

  const { isCachedData, lastUpdate } = pricesData || {}

  if (!isCachedData) return null

  const lastUpdateDate = lastUpdate
    ? new Date(lastUpdate)
        .toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        })
        .replace(' at', ',')
    : undefined

  const stringWithLastUpdate = lastUpdateDate
    ? `At the moment, prices are being displayed as of ${lastUpdateDate}.`
    : ''

  const onRefreshClick = () => {
    dispatch(pricesActions.fetchPrices(getChainsNamesForCoinGecko(chainsInfo)))
  }
  return (
    <>
      <AlertPanel
        alertType='warning'
        showDefaultIcon
        className={clsx('bs-mb-3', styles.PricesWarning)}
        alertPanelClassName={styles.PricesWarningAlertPanel}
        desc={`We\'re currently experiencing issues with fetching the latest 
        prices. ${stringWithLastUpdate} Try to refresh in a minute.`}
        actionButton={
          <Button
            className={styles.WarningButton}
            loading={loading}
            onClick={onRefreshClick}
          >
            Refresh
          </Button>
        }
      />
    </>
  )
}

export default PricesWarning
