import React, { FC } from 'react'
import { Row, Col, Button } from 'antd'
import { useIsMobileWidthOrDevice } from '../responsive/ResponsiveContext'
import { AccountCard } from './AccountCard'
import styles from './InterestingAccounts.module.sass'
import { Loading } from '../utils'
import Link from 'next/link'
import { isClientSide } from 'src/components/utils'
import { useTranslation } from 'react-i18next'
import { useOverviewAccounts } from 'src/rtk/features/interestingAccounts/interestingAccountsHooks'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { SectionTitle } from '../utils/index'

export const PreviewAccountsGrid: FC = () => {
  const isMobile = useIsMobileWidthOrDevice()
  const { t } = useTranslation()
  const { asPath } = useRouter()
  const overviewAccounts = useOverviewAccounts()

  const interestingAccountsUrl = asPath + (asPath === '/' ? '' : '/') + 'accounts'

  const showAllButton = isClientSide() ? <div className={clsx({ ['pl-3 bs-mb-2']: isMobile })}>
    <Link href={interestingAccountsUrl}>
      {t('general.showAll')}
    </Link>
  </div> : null

  return <div>
    <Row justify='space-between'>
      <Col>
        <SectionTitle 
          title={t('interestingAccounts.title')}
          className={clsx({ ['pr-3 pl-3']: isMobile })}
        />
      </Col>
      {!isMobile && <Col className={clsx({ ['bs-mr-3']: isMobile }, 'align-self-center')}>
        {showAllButton}
      </Col>}
    </Row>
    {isMobile && showAllButton}

    <div className='bs-mt-2'>
      {overviewAccounts == undefined || overviewAccounts?.length === 0
        ? <Loading label={'Loading...'} />
        : <Row justify={isMobile ? 'center' : undefined} gutter={{ xs: 18, sm: 25, md: 25, lg: 25, xl: 18 }}>
          {overviewAccounts.map((x, _) => (
            <Col key={x.account + x.type + x.relayChain} className={'mb-3'} >
              <AccountCard accountData={x} />
            </Col>))}
        </Row>}

      {isClientSide() && <div className={clsx({ ['pr-3 pl-3']: isMobile })}>
        <Link href={interestingAccountsUrl}>
          <Button className={styles.ShowAllButton} type='primary' block ghost >{t('general.showAll')}</Button>
        </Link>
      </div>}
    </div>
  </div>
}