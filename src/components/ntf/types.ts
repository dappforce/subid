import { CONTENT_TYPES } from '../../types'

export const supportedContentTypes: Record<string, CONTENT_TYPES> = {
  'application/pdf': CONTENT_TYPES.pdf,
  'audio/aac': CONTENT_TYPES.audio,
  'audio/flac': CONTENT_TYPES.audio,
  'audio/mpeg': CONTENT_TYPES.audio,
  'audio/ogg': CONTENT_TYPES.audio,
  'audio/wav': CONTENT_TYPES.audio,
  'audio/x-m4a': CONTENT_TYPES.audio,
  'image/bmp': CONTENT_TYPES.image,
  'image/gif': CONTENT_TYPES.gif,
  'image/heic': CONTENT_TYPES.image,
  'image/jpeg': CONTENT_TYPES.image,
  'image/png': CONTENT_TYPES.image,
  'image/svg+xml': CONTENT_TYPES.image,
  'image/tiff': CONTENT_TYPES.image,
  'image/webp': CONTENT_TYPES.image,
  'image/x-icon': CONTENT_TYPES.image,
  'application/json': CONTENT_TYPES.model,
  'model/gltf-binary': CONTENT_TYPES.model,
  'model/gltf+json': CONTENT_TYPES.model,
  'application/octet-stream': CONTENT_TYPES.model,
  'video/mp4': CONTENT_TYPES.video,
  'video/quicktime': CONTENT_TYPES.video,
  'video/webm': CONTENT_TYPES.video,
  'video/x-m4v': CONTENT_TYPES.video,
  'video/x-msvideo': CONTENT_TYPES.video,
}

export const getContentType = (metadata_content_type: string | undefined): CONTENT_TYPES => {
  if (!metadata_content_type) {
    return CONTENT_TYPES.unknown
  }

  const contentType = supportedContentTypes[metadata_content_type]

  return contentType || CONTENT_TYPES.unknown
}
