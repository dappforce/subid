import { TFunction } from 'i18next'
import { ColumnsType } from 'antd/lib/table'
import { Tooltip } from 'antd'
import { ExternalLink } from 'src/components/identity/utils'
import { InfoCircleOutlined } from '@ant-design/icons'
import styles from '../Table.module.sass'
import { BalanceVariant } from './types'

export const getBalanceTableColumns = (
  t: TFunction,
  isMyAddress: boolean,
  balancesVariant: BalanceVariant
): ColumnsType<any> => {
  const transferColumn: ColumnsType<any> = isMyAddress
    ? [ { title: '', dataIndex: 'transferAction', align: 'right' } ]
    : []
  return [
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          {balancesVariant === 'chains'
            ? t('table.labels.chain')
            : t('table.labels.token')}
        </h3>
      ),
      dataIndex: 'chain',
      className: styles.BalanceChainColumn,
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall bs-mr-4'>
          {t('table.labels.balance')}
        </h3>
      ),
      dataIndex: 'balance',
      align: 'right',
      className: styles.BalanceColumn,
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall d-flex align-items-center justify-content-end'>
          {t('table.labels.price')}
          <Tooltip
            className='ml-2'
            title={
              <div>
                {t('tooltip.informationFrom')}{' '}
                <ExternalLink
                  url='https://www.coingecko.com'
                  value='CoinGecko'
                />
              </div>
            }
          >
            <InfoCircleOutlined />
          </Tooltip>
        </h3>
      ),
      dataIndex: 'price',
      align: 'right',
    },
    {
      title: (
        <h3 className='font-weight-bold FontSmall'>
          {t('table.labels.totalValue')}
        </h3>
      ),
      dataIndex: 'total',
      align: 'right',
    },
    ...transferColumn,
    {
      title: '',
      dataIndex: 'links',
      className: styles.LinksColumn,
    },
  ]
}
