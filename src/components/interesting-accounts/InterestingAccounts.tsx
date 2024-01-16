import React, { FC } from 'react'
import { Row, Col, Button } from 'antd'
import { useIsMobileWidthOrDevice } from '../responsive/ResponsiveContext'
import { AccountCard } from './AccountCard'
import styles from './InterestingAccounts.module.sass'
import { Loading } from '../utils'
import Link from 'next/link'
import { isClientSide } from 'src/components/utils'
import { useTranslation } from 'react-i18next'
import {
  useFetchOverviewAccounts,
  useOverviewAccounts,
} from 'src/rtk/features/interestingAccounts/interestingAccountsHooks'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { SectionTitle } from '../utils/index'

export const PreviewAccountsGrid: FC = () => {
  useFetchOverviewAccounts()
  const isMobile = useIsMobileWidthOrDevice()
  const { t } = useTranslation()
  const { asPath } = useRouter()
  const overviewAccounts = useOverviewAccounts()

  const interestingAccountsUrl =
    asPath + (asPath === '/' ? '' : '/') + 'accounts'

  const showAllButton = isClientSide() ? (
    <div className={clsx({ ['mt-3 bs-mb-2']: isMobile })}>
      <Link href={interestingAccountsUrl} legacyBehavior>
        {t('general.showAll')}
      </Link>
    </div>
  ) : null

  return (
    <div>
      <Row justify='space-between'>
        <Col className={clsx({['w-100']: isMobile})}>
          <SectionTitle
            title={t('interestingAccounts.title')}
          />
        </Col>
        {!isMobile && (
          <Col className={clsx('align-self-center')}>
            {showAllButton}
          </Col>
        )}
      </Row>
      {isMobile && showAllButton}

      <div className='bs-mt-2'>
        {overviewAccounts == undefined || overviewAccounts?.length === 0 ? (
          <Loading label={'Loading...'} />
        ) : (
          <Row justify={isMobile ? 'center' : undefined} gutter={18}>
            {overviewAccounts.map((x, _) => (
              <Col
                key={x.account + x.type + x.relayChain}
                span={!isMobile ? 6 : undefined}
                className={clsx('bs-mb-3', { ['w-50']: isMobile })}
              >
                <AccountCard accountData={x} />
              </Col>
            ))}
          </Row>
        )}

        {isClientSide() && (
          <div className={clsx({ ['pr-3 pl-3']: isMobile })}>
            <Link href={interestingAccountsUrl}>
              <Button
                className={styles.ShowAllButton}
                type='primary'
                block
                ghost
              >
                {t('general.showAll')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
