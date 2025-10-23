import { Stack } from '@sanity/ui'
import { type ArrayOfObjectsInputProps } from 'sanity'
import { useEffect, useState } from 'react'

/**
 * Custom array input component that hides the "Add item" button after 1 item is added
 * Used for media fields that should only contain a single image or video
 */
export function SingleItemArrayInput(props: ArrayOfObjectsInputProps) {
  const { value, renderDefault } = props
  const [hasItem, setHasItem] = useState(false)

  useEffect(() => {
    // Check if array has at least 1 item
    setHasItem(Array.isArray(value) && value.length > 0)
  }, [value])

  return (
    <Stack space={3}>
      {/* Render default array input */}
      <div className={hasItem ? 'single-item-array-input' : ''}>
        {renderDefault(props)}
      </div>

      {/* Inject CSS to hide the "Add item" button when we have 1 item */}
      {hasItem && (
        <style>{`
          .single-item-array-input [data-testid="array-functions-menu-button"],
          .single-item-array-input button[aria-label*="Add"],
          .single-item-array-input button[data-testid*="add"] {
            display: none !important;
          }
        `}</style>
      )}
    </Stack>
  )
}
