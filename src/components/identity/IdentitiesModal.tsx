import { Modal } from 'antd'
import { IdentityView } from './Identity'
import { AccountIdentities } from './types'

type IdentitiesModalProps = {
  open: boolean
  close: () => void
  identities?: AccountIdentities
  address?: string
}

const IdentitiesModal = ({ open, close, identities, address }: IdentitiesModalProps) => {
  if (!identities || !address) return null

  return (
    <Modal
      footer={null}
      title={'On-chain identity'}
      visible={open}
      onCancel={close}
      width={600}
      className='DfSignInModal'
    >
      <div className='bs-px-4'>
        <IdentityView
          address={address}
          identity={identities}
          withTitle={false}
          withSection={false}
        />
      </div>
    </Modal>
  )
}

export default IdentitiesModal
