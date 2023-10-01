import styles from './Index.module.sass'
import { AvatarOrSkeleton } from '../../table/utils'
import { MutedDiv } from '../../utils/MutedText'
import { HiOutlineExternalLink } from 'react-icons/hi'
import clsx from 'clsx'

type VoteKind = 'aye' | 'nay'

type VoteRowProps = {
  voteKind: VoteKind
}

export const VoteRow = ({ voteKind }: VoteRowProps) => {
  const titleByKind = voteKind === 'aye' ? 'Aue' : 'Nay'

  const title = (
    <div className={styles.TransferTitle}>
      {titleByKind} <span>•</span>{' '}
      <MutedDiv className='d-flex align-items-center'>
        OpenGov <HiOutlineExternalLink className='ml-1' />
      </MutedDiv>
    </div>
  )

  return (
    <div className={styles.TransferRow}>
      <div className={styles.FirstCol}>
        <div className='d-flex align-items-center'>
          <AvatarOrSkeleton
            icon={'/polkadot.svg'}
            size={'large'}
            className='mr-2 align-items-start flex-shrink-none'
          />
          <div>
            <div className='font-weight-bold FontNormal'>{title}</div>
            <MutedDiv>15:46</MutedDiv>
          </div>
        </div>
      </div>
      <div className={styles.ProposalInfo}>
        <div className='font-weight-bold FontNormal'>
          #158 • PolkaWorld Ops and Maintenance proposal and bla bla bla
        </div>
        <MutedDiv>
          Hey community! After our 116th Opengov referendum was rejected,
          PolkaWorld has made adjustments to the proposal based on community
          feedback.
        </MutedDiv>
      </div>
      <div className='text-right'>
        <div className={clsx(styles.Tokens)}>32K DOT x3</div>
        <MutedDiv className={styles.Dollars}>96K DOT</MutedDiv>
      </div>
    </div>
  )
}
