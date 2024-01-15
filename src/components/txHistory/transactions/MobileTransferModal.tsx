import FloatingModal from '@/components/utils/FloatingModal'
import styles from './Transactions.module.sass'
import dayjs from 'dayjs'
import { Button } from 'antd'
import { RiArrowRightUpLine } from 'react-icons/ri'
import { useCurrentAccount } from '@/components/providers/MyExtensionAccountsContext'
import { AccountPreview, AvatarOrSkeleton } from '@/components/table/utils'
import { CopyAddress } from '../../homePage/address-views/utils/index'
import { toShortAddress } from '../../utils/index'
import Link from 'next/link'

type TransferInfo = {
  icon: string
  address: string
  balance: React.ReactNode
  totalBalance: React.ReactNode
  txKind: string
  timestamp: string
  extrinsicHash: string
  networkName: string
  subscanUrl: string
}

type MobileTransferModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  transferInfo: TransferInfo
}

const MobileTransferModal = ({
  open,
  setOpen,
  transferInfo,
}: MobileTransferModalProps) => {
  const {
    icon,
    address: recipientAddress,
    balance,
    totalBalance,
    txKind,
    timestamp,
    extrinsicHash,
    networkName,
    subscanUrl,
  } = transferInfo

  const currentAddresses = useCurrentAccount()

  const currentAddress = currentAddresses?.[0]

  const date = dayjs(timestamp).format('MMM DD, YYYY [at] HH:mm:ss ')

  const isRecieved = txKind === 'TRANSFER_TO'

  return (
    <FloatingModal
      position='bottom'
      open={open}
      setOpen={setOpen}
      className={'bg-white bs-p-3 FontNormal text-center'}
    >
      <div className={styles.ModalContent}>
        <div className={styles.TxContent}>
          <div className={styles[`Tokens-${isRecieved ? 'Recieved' : 'Send'}`]}>
            {isRecieved ? '+' : '-'}
            {balance}
          </div>
          <div className={styles.BalanceInDollar}>{totalBalance}</div>
          <div className={styles.SenderBlock}>
            <div>
              <span className={styles.GrayLabel}>Sender</span>
              <span>
                <Link
                  href={'/[address]'}
                  as={`/${currentAddress}`}
                  className='text-black'
                  target='_blank'
                  rel='noreferrer'
                >
                  <AccountPreview
                    withAddress={false}
                    account={currentAddress}
                    nameClassName={styles.EllipsisPreview}
                  />
                </Link>
              </span>
            </div>
            <div>
              <span className={styles.GrayLabel}>Network</span>
              <span>
                <AvatarOrSkeleton
                  icon={icon}
                  size={24}
                  className='align-items-start flex-shrink-none'
                />
                <span className='ml-2 font-weight-semibold'>{networkName}</span>
              </span>
            </div>
          </div>
          <div className={styles.TextBlock}>
            <span className={styles.GrayLabel}>Recipient</span>
            <span>
              <Link
                href={'/[address]'}
                as={`/${recipientAddress}`}
                className='text-black'
                target='_blank'
                rel='noreferrer'
              >
                <AccountPreview
                  withAddress={false}
                  account={recipientAddress}
                  nameClassName={styles.EllipsisPreview}
                />
              </Link>
            </span>
          </div>
          <div className={styles.TextBlock}>
            <span className={styles.GrayLabel}>Transaction ID</span>
            <span className='font-weight-semibold'>
              <CopyAddress
                address={extrinsicHash}
                iconVisibility={true}
                className='text-black'
                message='Extrinsic hash copied'
              >
                <span>{toShortAddress(extrinsicHash, 8)}</span>
              </CopyAddress>
            </span>
          </div>
          <div className={styles.Date}>{date}</div>
        </div>

        <Button
          href={subscanUrl}
          target={'_blank'}
          type='primary'
          ghost
          size={'large'}
        >
          <span className='d-flex align-items-center justify-content-center'>
            View on explorer <RiArrowRightUpLine className='ml-2' />
          </span>
        </Button>
      </div>
    </FloatingModal>
  )
}

export default MobileTransferModal
