import { backendUrl } from 'src/config/env'
import { AxiosResponse } from 'axios'
import axios from 'axios'

export function getBackendUrl (subUrl: string): string {
  return `${backendUrl}/api/v1/${subUrl}`
}

type SendRequestProps = {
  request: () => Promise<AxiosResponse<any, any>>
  onFailReturnedValue: any
  onFailedText: string
}

export const sendRequest = async ({ request, onFailReturnedValue, onFailedText }: SendRequestProps) => {
  try {
    const res = await request()
    if (res.status !== 200) {
      console.warn(onFailedText)
    }

    return res.data
  } catch (err) {
    console.error(onFailedText, err)
    return onFailReturnedValue
  }
}

type GetParams = {
  url: string
  config?: any
}

type SendGetRequestProps = {
  params: GetParams
  onFailReturnedValue: any
  onFailedText: string
  timeout?: number
}

export const sendGetRequest = ({ params: { url, config }, ...otherProps }: SendGetRequestProps) => (
  sendRequest({  
    request: () => axios.get(getBackendUrl(url), config),
    ...otherProps
  })
)