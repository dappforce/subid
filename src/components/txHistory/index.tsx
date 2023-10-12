import { Button } from 'antd'
import styles from './Index.module.sass'
import { TransferRow } from './transactions/Transfer'
import { VoteRow } from './transactions/Vote'
import { ClaimRow } from './transactions/Claim'

const ActionButtons = () => {
  return <div className={styles.ActionButtons}>
    <div className={styles.Filters}>
      <Button type='primary' ghost>Networks</Button>
      <Button type='primary' ghost>Events</Button>
      <Button type='primary' ghost>Tokens</Button>
    </div>
    <Button type='primary' ghost>Download CSV</Button>
    
  </div>
}

const TxHistoryLayout = () => {
  return <div className={styles.TxHistoryLayout}>
    <ActionButtons />
    <div>
      <TransferRow transferKind='receive' />
      <ClaimRow />
      <TransferRow transferKind='send' />
      <VoteRow voteKind='aye' />
      <VoteRow voteKind='nay' />
      <ClaimRow />
    </div>
  </div>
}

export default TxHistoryLayout