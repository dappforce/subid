import { Button, Collapse, Modal } from 'antd'
import { useState } from 'react'
import clsx from 'clsx'
import styles from './Staking.module.sass'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

const { Panel } = Collapse

type FAQModalProps = {
  open: boolean
  close: () => void
}

const buildStakingFAQ = (t: TFunction) => [
  {
    title: t('staking.FAQ.whatIs.title'),
    desc: t('staking.FAQ.whatIs.desc')
  },
  {
    title: t('staking.FAQ.whichCollator.title'),
    desc: t('staking.FAQ.whichCollator.desc')
  },
  {
    title: t('staking.FAQ.canIStake.title'),
    desc: t('staking.FAQ.canIStake.desc')
  },
  {
    title: t('staking.FAQ.canIModify.title'),
    desc: t('staking.FAQ.canIModify.desc')
  }
]

export const FAQModal = ({ open, close }: FAQModalProps) => {
  const { t } = useTranslation()

  const stakingFAQ = buildStakingFAQ(t)

  return <Modal
    visible={open}
    title={<h3 className='font-weight-bold m-0'>Staking FAQ</h3>}
    footer={null}
    width={600}
    destroyOnClose
    className={clsx('DfStakingModal', styles.StakingModal)}
    onCancel={close}
  >
    <Collapse ghost>
      {stakingFAQ.map(({ title, desc }, i) => (
        <Panel className={styles.CollapseItem} header={title} key={i.toString()}>
          <p>{desc}</p>
        </Panel>))}
    </Collapse>
  </Modal>
}

export const FAQModalButton = () => {
  const [ open, setOpen ] = useState(false)

  return <>
    <Button type='link' className={styles.FAQButton} onClick={() => setOpen(true)}>Read FAQ</Button>
    <FAQModal open={open} close={() => setOpen(false)} />
  </>
}