import { Card, Stack } from '@sanity/ui'
import { type FileInputProps, useClient } from 'sanity'
import { useEffect, useState } from 'react'

/**
 * Custom file input component that shows visual previews for videos and images
 * Used for mainMedia and thumbnailMedia fields to provide better UX
 *
 * This component wraps Sanity's default FileInput and adds a preview below it
 */
export function MediaFileInput(props: FileInputProps) {
  const { value, renderDefault } = props
  const client = useClient({ apiVersion: '2023-01-01' })

  const [assetUrl, setAssetUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string | null>(null)

  // Get the asset information from the value
  useEffect(() => {
    if (!value?.asset) {
      setAssetUrl(null)
      setMimeType(null)
      return
    }

    try {
      const asset = value.asset

      // Get project config
      const projectId = client.config().projectId
      const dataset = client.config().dataset

      if (!projectId || !dataset) {
        console.error('Missing project config')
        return
      }

      // Extract asset reference
      let assetRef: string | null = null
      if (typeof asset === 'object' && asset !== null) {
        if ('_ref' in asset && typeof asset._ref === 'string') {
          assetRef = asset._ref
        } else if ('_id' in asset && typeof asset._id === 'string') {
          assetRef = asset._id
        }
      }

      if (!assetRef) {
        console.error('Could not extract asset reference')
        return
      }

      // Parse asset reference to construct URL
      // Format: file-{assetId}-{extension} or image-{assetId}-{dimensions}-{extension}
      let url: string | null = null
      let extension: string | null = null

      if (assetRef.startsWith('file-')) {
        // File asset: file-{assetId}-{extension}
        const parts = assetRef.split('-')
        if (parts.length >= 3) {
          extension = parts[parts.length - 1]
          const assetId = parts.slice(1, -1).join('-')
          url = `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${extension}`
        }
      } else if (assetRef.startsWith('image-')) {
        // Image asset: image-{assetId}-{dimensions}-{extension}
        const parts = assetRef.split('-')
        if (parts.length >= 4) {
          extension = parts[parts.length - 1]
          const dimensions = parts[parts.length - 2]
          const assetId = parts.slice(1, -2).join('-')
          url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${extension}`
        }
      }

      if (url && extension) {
        setAssetUrl(url)

        // Try to get mimeType from asset object first
        if ('mimeType' in asset && typeof asset.mimeType === 'string') {
          setMimeType(asset.mimeType)
        } else {
          // Infer from file extension if mimeType not available
          if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension.toLowerCase())) {
            setMimeType(`video/${extension}`)
          } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension.toLowerCase())) {
            setMimeType(`image/${extension}`)
          }
        }
      }
    } catch (error) {
      console.error('Failed to resolve asset:', error)
      setAssetUrl(null)
      setMimeType(null)
    }
  }, [value, client])

  // Determine if we should show a preview
  const isVideo = mimeType?.startsWith('video/')
  const isImage = mimeType?.startsWith('image/')
  const showPreview = (isVideo || isImage) && assetUrl

  return (
    <Stack space={3}>
      {/* Render default Sanity file input */}
      {renderDefault(props)}

      {/* Add preview below the default input */}
      {showPreview && (
        <Card border padding={0} radius={2} overflow="hidden" tone="transparent">
          {isVideo && assetUrl && (
            <video
              controls
              style={{
                width: '100%',
                maxHeight: '400px',
                display: 'block',
                backgroundColor: '#000',
              }}
              preload="metadata"
            >
              <source src={assetUrl} type={mimeType || undefined} />
              Your browser does not support the video tag.
            </video>
          )}
          {isImage && assetUrl && (
            <img
              src={assetUrl}
              alt="Media preview"
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                display: 'block',
                backgroundColor: '#f1f1f1',
              }}
            />
          )}
        </Card>
      )}
    </Stack>
  )
}
