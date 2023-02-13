export function decodeExtrinsicString (method: string) {
  const groupingRegex = /(.+)\((.*)\)/
  const groups = method.match(groupingRegex)
  
  let extrinsicMethod: string[] | null = null
  let params: string[] | null = null

  if (groups) {
    extrinsicMethod = groups[1]?.split('.') || null
    params = groups[2]?.split(',') || null
  }

  return {
    extrinsicTokens: extrinsicMethod,
    extrinsic: groups?.[1] ?? '',
    params
  }
}

export function getExtrinsicParams <V = Record<string, any>> (methodString: string, paramsData: V) {
  const { params } = decodeExtrinsicString(methodString)
  if (!params) return []

  const usedParams: any[] = []
  params.forEach((paramName) => {
    usedParams.push(paramsData[paramName as keyof V])
  })
  return usedParams
}
