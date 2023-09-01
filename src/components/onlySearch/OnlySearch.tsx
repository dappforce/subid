import React from 'react'
import SearchInput from '../search/SearchInput'
import { Button } from 'antd'
import styles from './OnlySearch.module.sass'
import { useMyExtensionAccount } from '../providers/MyExtensionAccountsContext'
import { useResponsiveSize } from '../responsive'
import { PreviewAccountsGrid } from '../interesting-accounts/InterestingAccounts'
import { useTranslation } from 'react-i18next'

const OnlySearch = () => {
  const { openModal } = useMyExtensionAccount()
  const { t } = useTranslation()
  const { isMobile } = useResponsiveSize()

  const onClick = () => {
    openModal()
  }

  const connectWalletButton = <Button
    onClick={onClick}
    block={isMobile ? true : false}
    className={styles.ConnectButton}
    size='large'
    type='primary'
  >
    {t('general.connectWallet')}
  </Button>

  const backgroundImg = isMobile ? '/images/only-search-bg-mobile.png' : '/images/only-search-bg.png'

  return (
    <div className={styles.OnlySearchPage}>
      <div>
        <div className={styles.TopSection} style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className={styles.BodyContent}>
            <div className={styles.Header}>
              <a className={styles.Logo} href='/'>
                <img src='images/subid-white.svg' alt={'Sub.ID'} />
              </a>
              {!isMobile && connectWalletButton}
            </div>
            <div className={styles.Title}>
              <p className={styles.Heading}>
                {t('general.aboutSubId')}
              </p>
            </div>
            {isMobile &&
              <div className={styles.SearchInput}>
                {connectWalletButton}
                <SearchInput size='large' className={`mt-3 ${styles.SearchInputBox}`} autoFocus={true} />
              </div>}
          </div>
        </div>
      </div>
      <div>
        {!isMobile ? <div className={styles.SearchInput}>
          <SearchInput size='large' className={`h-75 ${styles.SearchInputBox}`} autoFocus={true} />
        </div> : <></>}
      </div>
      <div className={styles.BodyWrapper}>
        <div className={'DfSectionOuter DfSectionOuterHomePage'}>
          <PreviewAccountsGrid />
        </div>
      </div>
    </div>
  )
}

export default OnlySearch
