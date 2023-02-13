import { SubsocialIpfsApi } from '@subsocial/api'
import config from 'src/config'

const { useOffchainForIpfs, dagHttpMethod, ipfsUrl, offchainUrl } = config

export const getIpfs = () => {
  const useServer = useOffchainForIpfs ? {
      httpRequestMethod: dagHttpMethod as any
    } : undefined

  return new SubsocialIpfsApi({
    useServer,
    ipfsNodeUrl: ipfsUrl,
    offchainUrl
  })
}
