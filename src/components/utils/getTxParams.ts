import { newLogger } from '@subsocial/utils'
import {
  CommentContent,
  PostContent,
  SpaceContent,
  SharedPostContent,
  IpfsCid,
} from '@subsocial/types'
import type { SubsocialIpfsApi } from '@subsocial/api'

const log = newLogger('BuildTxParams')

// TODO rename setIpfsCid -> setIpfsCid
type Params<C extends CommonContent> = {
  ipfs: SubsocialIpfsApi
  json: C
  setIpfsCid: (cid: IpfsCid) => void
  buildTxParamsCallback: (cid: IpfsCid) => any[]
}

export type ExtendedSpaceContent = Partial<SpaceContent> & {
  banner?: string
}

type CommonContent =
  | CommentContent
  | PostContent
  | SpaceContent
  | ExtendedSpaceContent
  | SharedPostContent

// TODO rename to: pinToIpfsAndBuildTxParams()
export const getTxParams = async <C extends CommonContent>({
  ipfs,
  json,
  setIpfsCid,
  buildTxParamsCallback,
}: Params<C>) => {
  try {
    const cid = (await ipfs.saveContent(json as any))?.toString()
    if (cid) {
      setIpfsCid(cid)
      return buildTxParamsCallback(cid)
    } else {
      log.error('Save to IPFS returned an undefined CID')
    }
  } catch (err) {
    log.error(`Failed to build tx params. ${err}`)
  }
  return []
}
