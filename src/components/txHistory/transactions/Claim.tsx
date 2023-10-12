import styles from './Index.module.sass'
import { Address, AccountPreview, AvatarOrSkeleton } from '../../table/utils'
import { MutedDiv } from '../../utils/MutedText'
import { HiOutlineExternalLink } from 'react-icons/hi'
import clsx from 'clsx'
import { Divider } from 'antd'

type ClaimRowProps = {}

export const ClaimRow = ({ }: ClaimRowProps) => {
  const title = (
    <div className={styles.TransferTitle}>
      Claimed <span>•</span>{' '}
      <MutedDiv className='d-flex align-items-center font-weight-normal'>
        Crowdloan <HiOutlineExternalLink className='ml-1' />
      </MutedDiv>
    </div>
  )

  return (
    <div>
      <div className={styles.TransferRow}>
        <div className={styles.FirstCol}>
          <div
            className={clsx(
              'd-flex align-items-center',
              styles.FirstColContent
            )}
          >
            <AvatarOrSkeleton
              icon={'/polkadot.svg'}
              size={'large'}
              className='bs-mr-2 align-items-start flex-shrink-none'
            />
            <div>
              <div className='font-weight-bold FontNormal'>{title}</div>
              <MutedDiv>21:34</MutedDiv>
            </div>
          </div>
        </div>
        <div>
          <MutedDiv>To</MutedDiv>
          <AccountPreview
            withAddress={false}
            account='5FToy6nuBv7p6EtTHd2xW8neztzSTpPjtwMevTyBw6j91QKe'
          />
          <Address
            name='Polkadot'
            accountId='5FToy6nuBv7p6EtTHd2xW8neztzSTpPjtwMevTyBw6j91QKe'
            isShortAddress
            withCopy
            withQr={false}
          />
        </div>
        <div className='text-right'>
          <div
            className={clsx(styles.Tokens, styles.RecievedTokens)}
          >
            32.123 KSM
          </div>
          <MutedDiv className={styles.Dollars}>$255.69</MutedDiv>
        </div>
      </div>
      <Divider className={clsx('m-0', styles.RowDivider)} />
    </div>
  )
}
