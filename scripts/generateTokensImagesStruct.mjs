import { promises as fs } from 'fs'

const generateTokensImagesStruct = async () => {
  const tokensImages = await fs.readdir('./public/images/tokens-centric')

  let tokenImagesByTokenId = {}

  tokensImages.forEach((tokenImage) => {
    const tokenId = tokenImage.split('.')[0]
    tokenImagesByTokenId[tokenId.toLowerCase()] = tokenImage
  })

  await fs.writeFile(
    './public/images/folderStructs/token-centric-images.json',
    JSON.stringify(tokenImagesByTokenId, null, 2)
  )
}

generateTokensImagesStruct()
