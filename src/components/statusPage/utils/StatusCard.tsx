import React, { useState, useEffect } from 'react'
import { Card, Col, Row } from 'antd'
import { useChainInfo } from '../../../rtk/features/multiChainInfo/multiChainInfoHooks'
import { ChainInfo, supportedNetworks, MultiChainInfo } from '../../../rtk/features/multiChainInfo/types'
import { ChainData } from '../../table/utils'
import styles from '../StatusPage.module.sass'
import { getConnectedStatus } from 'src/api'
import { MINUTES, Loading } from '../../utils/index'
import { partition } from 'lodash'
import clsx from 'clsx'
import { isEmptyArray } from '@subsocial/utils'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'

type StatusWithNetwork = {
  network: string
  status: boolean
}

export const useIsAllNetworksConnected = () => {
  const statuses = useGetChainStatuses()

  return !!statuses?.every(x => x.status === true)
}

export const useGetChainStatuses = () => {
  const [ connectedStatus, setConnectedStatus ] = useState<StatusWithNetwork[]>()

  const checkForConnected = async () => {
    (async () => {
      const statusesPromise = supportedNetworks.map(async (network) => {
        const status = await getConnectedStatus(network)

        return {
          network,
          status
        }
      })

      const statuses = await Promise.all(statusesPromise)

      if (statuses) {
        setConnectedStatus(statuses as StatusWithNetwork[])
      }
    })()
  }
  const checkAfterFiveMins = () => {
    setInterval(checkForConnected, 1 * MINUTES)
  }

  useEffect(() => {
    checkForConnected()
    checkAfterFiveMins()
  }, [])

  return connectedStatus
}

type Props = {
  data: ChainInfo
  key: number
  status: boolean
  className: string
}

const StatusCard = ({ data, key, status, className }: Props) => {
  const { isMobile } = useResponsiveSize()
  const { name, icon, id } = data || {}

  if (!supportedNetworks.includes(id)) return null

  return <Col key={key} className={clsx(styles.StatusCol, className)}>
    <Card className={clsx(styles.StatusCard, { [styles.Disconnected]: !status })}>
      <ChainData
        name={name}
        icon={icon}
        avatarSize={isMobile ? 'small' : 'large'}
        isMonosizedFont={false}
        withCopy={false}
      />
    </Card>
  </Col>

}

type StatusSectionProps = {
  title: string
  statuses: StatusWithNetwork[]
  chainsInfo: MultiChainInfo
  className?: string
}

const StatusSection = ({ title, statuses, chainsInfo, className }: StatusSectionProps) => {
  const { isMobile } = useResponsiveSize()

  if(isEmptyArray(statuses)) return null

  const numberOfColumn = isMobile ? 2 : 3

  const sectionTitle =
    <h2 className={clsx({ ['ml-3']: isMobile })}>{title} networks: {statuses.length} / {supportedNetworks.length}</h2>

  const statusItems = statuses.map(({ status, network }, index) => {
    const chainInfoByNetwork = chainsInfo[network]

    return <StatusCard className={clsx({ [styles.CardMargin]: (index + 1) % numberOfColumn !== 0 })} key={index} data={chainInfoByNetwork} status={status} />
  })

  return <div className={className}>
    {sectionTitle}

    <Row justify={isMobile ? 'center' : 'start'}>{statusItems}</Row>
  </div>
}


const StatusCards = () => {
  const chainsInfo = useChainInfo()
  const statuses = useGetChainStatuses()

  if (!statuses) return <Loading />

  const [ disconnected, connected ] = partition(statuses, (x) => !x.status)

  return <>
    <StatusSection
      title='Disconnected'
      statuses={disconnected}
      chainsInfo={chainsInfo}
      className='mb-3'
    />

    <StatusSection
      title='Connected'
      statuses={connected}
      chainsInfo={chainsInfo}
    />
  </>
}

export default StatusCards
