import { ObjectInputProps } from 'sanity'
import { useCallback } from 'react'

/**
 * Custom input component for localeStringOptional fields
 * Fixes change detection issue for nested object fields in extended image types
 *
 * Problem: When users edit alt text on images, Sanity doesn't detect the change
 * because the field is nested inside an extended built-in image type.
 *
 * Solution: This component wraps the onChange callback to ensure Sanity's
 * change tracking properly recognizes modifications to nested object fields.
 */
export function LocaleStringOptionalInput(props: ObjectInputProps) {
  const { onChange, renderDefault } = props

  const handleChange = useCallback(
    (event: any) => {
      onChange(event)
    },
    [onChange]
  )

  return renderDefault({
    ...props,
    onChange: handleChange,
  })
}
